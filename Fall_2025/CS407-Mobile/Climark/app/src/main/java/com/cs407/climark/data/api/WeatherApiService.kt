package com.cs407.climark.data.api

import com.cs407.climark.data.models.WeatherApiResponse
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

interface WeatherApiService {
    @GET(value = "v1/forecast")
    suspend fun getWeatherData(
        @Query(value = "latitude") latitude: Double,
        @Query(value = "longitude") longitude: Double,
        @Query(value = "daily") daily: String = "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
        @Query(value = "timezone") timezone: String = "auto",
        @Query(value = "past_days") pastDays: Int = 3,
        @Query(value = "forecast_days") forecastDays: Int = 4
    ): WeatherApiResponse
}

object RetrofitInstance {
    private const val BASE_URL = "https://api.open-meteo.com/"

    val weatherApi: WeatherApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(WeatherApiService::class.java)
    }
}
