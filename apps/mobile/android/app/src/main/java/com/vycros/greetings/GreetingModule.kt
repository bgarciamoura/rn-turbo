package com.vycros.greetings

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class GreetingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "Greeting"

    @ReactMethod
    fun getGreeting(name: String, promise: Promise) {
        val greeting = "Olá, $name! Esta saudação veio do Kotlin nativo!"
        promise.resolve(greeting)  
    }
}
