package com.cs407.climark.data.models

data class WeatherApiResponse(
    val latitude: Double,
    val longitude: Double,
    val timezone: String,
    val daily: DailyData
)

data class DailyData(
    val time: List<String>,
    val temperature_2m_max: List<Double>,
    val temperature_2m_min: List<Double>,
    val precipitation_probability_max: List<Int>,
    val weather_code: List<Int>
)
