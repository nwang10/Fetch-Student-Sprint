package com.cs407.climark.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cs407.climark.ui.viewModels.MapViewModel
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerComposable
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.maps.android.compose.rememberMarkerState
import kotlinx.coroutines.launch

@Composable
fun MapScreen(
    viewModel: MapViewModel = viewModel()
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    // Observe the current UI state from the ViewModel.
    // This automatically updates the UI whenever data changes.
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Show snackbar when entering "Add Marker" mode
    LaunchedEffect(uiState.isAddingMarker) {
        if (uiState.isAddingMarker) {
            snackbarHostState.showSnackbar("Tap on the map to place a marker")
        }
    }

    // Show snackbar when entering "Delete Marker" mode
    LaunchedEffect(uiState.isDeletingMarker) {
        if (uiState.isDeletingMarker) {
            snackbarHostState.showSnackbar("Tap a marker to delete it, or tap elsewhere to cancel")
        }
    }

    // Initialize the location client once when the composable first launches
    LaunchedEffect(Unit) {
        viewModel.initializeLocationClient(context)
    }

    // Ask for location permission if not already granted
    LocationPermissionHelper { granted ->
        viewModel.updateLocationPermission(granted)
        if (granted) {
            viewModel.getCurrentLocation()
        }
    }

    // Define a default (fallback) location, for example the UW-Madison campus.
    // This ensures that the map loads to a valid position even before
    // the user's actual location is obtained.
    val defaultLocation = LatLng(43.0731, -89.4012) // Madison, WI

    // Create a camera state to control and remember the map's current viewpoint.
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultLocation, 12f)
    }

    // Automatically move (animate) the camera when the location changes.
    // LaunchedEffect runs a coroutine whenever uiState.currentLocation updates.
    LaunchedEffect(uiState.currentLocation) {
        uiState.currentLocation?.let { location ->
            cameraPositionState.position = CameraPosition.fromLatLngZoom(
                location, 15f // 15f = street-level zoom
            )
        }
    }

    // Box layout allows us to overlay the FAB on top of the map
    Box(modifier = Modifier.fillMaxSize()) {
        // Display the Google Map on screen
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            onMapClick = { latLng ->
                when {
                    // Add marker if in "add marker" mode
                    uiState.isAddingMarker -> {
                        viewModel.addMarker(latLng)
                    }
                    // Cancel delete mode if in "delete marker" mode and clicked elsewhere
                    uiState.isDeletingMarker -> {
                        viewModel.disableDeleteMarkerMode()
                    }
                    // Dismiss weather card if it's showing
                    uiState.selectedMarkerLocation != null -> {
                        viewModel.clearWeatherData()
                    }
                }
            }
        ) {
            // Display the current location marker when available (custom blue circle)
            uiState.currentLocation?.let { location ->
                MarkerComposable(
                    state = MarkerState(position = location),
                    content = {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    Color.Blue,
                                    shape = CircleShape
                                )
                                .border(
                                    3.dp,
                                    Color.White,
                                    CircleShape
                                )
                        )
                    }
                )
            }

            // Display all user-added markers with standard Google Maps pin appearance
            uiState.markers.forEach { markerLocation ->
                Marker(
                    state = rememberMarkerState(position = markerLocation),
                    title = "Marker at (${String.format("%.4f", markerLocation.latitude)}, ${String.format("%.4f", markerLocation.longitude)})",
                    onClick = {
                        // Only allow deletion if in delete mode
                        if (uiState.isDeletingMarker) {
                            viewModel.removeMarker(markerLocation)
                            true // Consume the click event
                        } else {
                            // Animate camera to marker position
                            coroutineScope.launch {
                                cameraPositionState.animate(
                                    update = CameraUpdateFactory.newLatLngZoom(
                                        markerLocation,
                                        15f
                                    )
                                )
                            }
                            // Fetch weather data when marker is clicked
                            viewModel.fetchWeatherData(markerLocation)
                            false // Don't consume the click (show info window)
                        }
                    }
                )
            }
        }

        // Weather info card - show if marker is selected (even if data is still loading)
        val selectedLocation = uiState.selectedMarkerLocation
        val weatherData = uiState.weatherData
        if (selectedLocation != null) {
            if (uiState.isLoadingWeather) {
                // Show loading card
                Card(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(16.dp)
                        .fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(60.dp),
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Loading weather data...",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            } else if (weatherData != null) {
                // Show weather data card
                WeatherInfoCard(
                    weatherData = weatherData,
                    location = selectedLocation,
                    onDismiss = { viewModel.clearWeatherData() },
                    modifier = Modifier.align(Alignment.TopCenter)
                )
            }
        }

        // Column to stack FABs vertically in bottom-left corner
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(all = 16.dp)
        ) {
            // FAB to enable "Add Marker" mode
            FloatingActionButton(
                modifier = Modifier.size(size = 60.dp),
                onClick = {
                    viewModel.clearWeatherData() // Dismiss weather card
                    viewModel.enableAddMarkerMode()
                },
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = "Add Marker",
                    modifier = Modifier.size(size = 30.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // FAB to enable "Delete Marker" mode
            FloatingActionButton(
                modifier = Modifier.size(size = 60.dp),
                onClick = {
                    viewModel.clearWeatherData() // Dismiss weather card
                    viewModel.enableDeleteMarkerMode()
                },
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer
            ) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "Delete Marker",
                    modifier = Modifier.size(size = 30.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // FAB to re-center the map on user's location
            FloatingActionButton(
                modifier = Modifier.size(size = 60.dp),
                onClick = {
                    viewModel.clearWeatherData() // Dismiss weather card
                    uiState.currentLocation?.let { location ->
                        coroutineScope.launch {
                            cameraPositionState.animate(
                                update = CameraUpdateFactory.newLatLngZoom(
                                    location,
                                    15f
                                )
                            )
                        }
                    }
                },
                containerColor = MaterialTheme.colorScheme.background,
                contentColor = MaterialTheme.colorScheme.onBackground
            ) {
                Icon(
                    imageVector = Icons.Filled.LocationOn,
                    contentDescription = "Your Location",
                    modifier = Modifier.size(size = 50.dp)
                )
            }
        }

        // Snackbar host for showing messages
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun MapScreenPreview() {
    MapScreen()
}
