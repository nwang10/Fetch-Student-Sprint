package com.cs407.climark.ui.viewModels

import android.annotation.SuppressLint
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cs407.climark.data.api.RetrofitInstance
import com.cs407.climark.data.models.WeatherApiResponse
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class MapState(
    // A list of markers currently displayed on the map
    val markers: List<LatLng> = emptyList(),
    // Stores the user's most recent location (if available)
    val currentLocation: LatLng? = null,
    // Tracks whether location permissions are granted
    val locationPermissionGranted: Boolean = false,
    // Indicates when location or map data is being loaded
    val isLoading: Boolean = false,
    // Stores any error message encountered
    val error: String? = null,
    // Tracks whether we're in "add marker" mode
    val isAddingMarker: Boolean = false,
    // Tracks whether we're in "delete marker" mode
    val isDeletingMarker: Boolean = false,
    // Stores weather data for selected location
    val weatherData: WeatherApiResponse? = null,
    // Tracks whether weather data is loading
    val isLoadingWeather: Boolean = false,
    // Stores the selected marker location for weather info
    val selectedMarkerLocation: LatLng? = null
)

class MapViewModel : ViewModel() {
    // Backing property (private) for state: MutableStateFlow allows us
    // to update data internally
    private val _uiState = MutableStateFlow(MapState())
    // Publicly exposed immutable StateFlow for the UI layer to observe changes safely
    val uiState = _uiState.asStateFlow()

    // FusedLocationProviderClient interacts with Android's location services
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Initializes the location client when a valid Context becomes available
    fun initializeLocationClient(context: Context) {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
    }

    // Coroutine function to fetch the user's current location
    @SuppressLint("MissingPermission")
    fun getCurrentLocation() {
        viewModelScope.launch {
            try {
                // 1- Set isLoading to true and clear previous errors
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                // 2- Retrieve the last known location using fusedLocationClient
                val location = fusedLocationClient.lastLocation.await()

                // 3- Handle cases where location is null (set an appropriate error message)
                if (location == null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Unable to retrieve location. Please ensure location services are enabled."
                    )
                } else {
                    // 4- If successful, update currentLocation with latitude and longitude
                    val latLng = LatLng(location.latitude, location.longitude)
                    _uiState.value = _uiState.value.copy(
                        currentLocation = latLng,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                // 6- Wrap logic inside try-catch to handle possible exceptions
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Error fetching location: ${e.message}"
                )
            }
        }
    }

    // Updates permission flag when the user grants or denies location access
    fun updateLocationPermission(granted: Boolean) {
        _uiState.value = _uiState.value.copy(locationPermissionGranted = granted)
    }

    // Toggles "add marker" mode on
    fun enableAddMarkerMode() {
        _uiState.value = _uiState.value.copy(isAddingMarker = true, isDeletingMarker = false)
    }

    // Toggles "delete marker" mode on
    fun enableDeleteMarkerMode() {
        _uiState.value = _uiState.value.copy(isDeletingMarker = true, isAddingMarker = false)
    }

    // Disables "delete marker" mode
    fun disableDeleteMarkerMode() {
        _uiState.value = _uiState.value.copy(isDeletingMarker = false)
    }

    // Adds a new marker at the specified location
    fun addMarker(location: LatLng) {
        val currentMarkers = _uiState.value.markers.toMutableList()
        currentMarkers.add(location)
        _uiState.value = _uiState.value.copy(
            markers = currentMarkers,
            isAddingMarker = false // Exit add mode after placing marker
        )
    }

    // Removes a marker at the specified location
    fun removeMarker(location: LatLng) {
        val currentMarkers = _uiState.value.markers.toMutableList()
        currentMarkers.remove(location)
        _uiState.value = _uiState.value.copy(
            markers = currentMarkers,
            isDeletingMarker = false // Exit delete mode after removing marker
        )
    }

    // Fetches weather data for a given location
    fun fetchWeatherData(location: LatLng) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoadingWeather = true,
                    selectedMarkerLocation = location
                )

                val weatherResponse = RetrofitInstance.weatherApi.getWeatherData(
                    latitude = location.latitude,
                    longitude = location.longitude
                )

                _uiState.value = _uiState.value.copy(
                    weatherData = weatherResponse,
                    isLoadingWeather = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoadingWeather = false,
                    error = "Failed to fetch weather data: ${e.message}"
                )
            }
        }
    }

    // Clears weather data (closes the weather card)
    fun clearWeatherData() {
        _uiState.value = _uiState.value.copy(
            weatherData = null,
            selectedMarkerLocation = null
        )
    }
}
