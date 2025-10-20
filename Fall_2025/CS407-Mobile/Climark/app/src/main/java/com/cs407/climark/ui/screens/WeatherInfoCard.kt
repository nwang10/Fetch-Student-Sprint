package com.cs407.climark.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cs407.climark.data.models.WeatherApiResponse
import com.google.android.gms.maps.model.LatLng
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun WeatherInfoCard(
    weatherData: WeatherApiResponse,
    location: LatLng,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(16.dp)
        ) {
            // Header with location and close button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Weather Forecast",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Lat: ${"%.2f".format(location.latitude)}, Lon: ${"%.2f".format(location.longitude)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close"
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Weather days list
            LazyColumn(
                modifier = Modifier.heightIn(max = 400.dp)
            ) {
                itemsIndexed(weatherData.daily.time) { index, dateString ->
                    WeatherDayItem(
                        date = dateString,
                        maxTemp = weatherData.daily.temperature_2m_max[index],
                        minTemp = weatherData.daily.temperature_2m_min[index],
                        precipitationChance = weatherData.daily.precipitation_probability_max[index],
                        weatherCode = weatherData.daily.weather_code[index],
                        isToday = isToday(dateString)
                    )
                }
            }
        }
    }
}

@Composable
fun WeatherDayItem(
    date: String,
    maxTemp: Double,
    minTemp: Double,
    precipitationChance: Int,
    weatherCode: Int,
    isToday: Boolean
) {
    val backgroundColor = if (isToday) {
        MaterialTheme.colorScheme.primaryContainer
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Date and day
            Column(modifier = Modifier.weight(1f)) {
                val displayDate = formatDate(date)
                val dayLabel = when {
                    isToday -> "Today"
                    else -> displayDate.first
                }
                Text(
                    text = dayLabel,
                    fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 16.sp
                )
                Text(
                    text = displayDate.second,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Weather icon
            Text(
                text = getWeatherIcon(weatherCode),
                fontSize = 32.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            // Precipitation
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.width(60.dp)
            ) {
                Text(
                    text = "💧 $precipitationChance%",
                    fontSize = 12.sp
                )
            }

            // Temperature
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.width(80.dp)
            ) {
                Text(
                    text = "↑ ${maxTemp.toInt()}°C",
                    fontWeight = FontWeight.Bold,
                    color = Color.Red,
                    fontSize = 14.sp
                )
                Text(
                    text = "↓ ${minTemp.toInt()}°C",
                    fontWeight = FontWeight.Bold,
                    color = Color.Blue,
                    fontSize = 14.sp
                )
            }
        }
    }
}

fun isToday(dateString: String): Boolean {
    val date = LocalDate.parse(dateString)
    return date == LocalDate.now()
}

fun formatDate(dateString: String): Pair<String, String> {
    val date = LocalDate.parse(dateString)
    val dayOfWeek = date.format(DateTimeFormatter.ofPattern("EEEE", Locale.getDefault()))
    val monthDay = date.format(DateTimeFormatter.ofPattern("MMM d", Locale.getDefault()))
    return Pair(dayOfWeek, monthDay)
}

fun getWeatherIcon(weatherCode: Int): String {
    // WMO Weather interpretation codes (WW)
    return when (weatherCode) {
        0 -> "☀️" // Clear sky
        1, 2, 3 -> "⛅" // Mainly clear, partly cloudy, and overcast
        45, 48 -> "🌫️" // Fog
        51, 53, 55 -> "🌦️" // Drizzle
        61, 63, 65 -> "🌧️" // Rain
        71, 73, 75 -> "🌨️" // Snow
        77 -> "❄️" // Snow grains
        80, 81, 82 -> "🌧️" // Rain showers
        85, 86 -> "🌨️" // Snow showers
        95 -> "⛈️" // Thunderstorm
        96, 99 -> "⛈️" // Thunderstorm with hail
        else -> "🌤️" // Default
    }
}
