// Runs the pure-Kotlin core of the SMS detector (no Android types) on a plain JVM, so the
// pre-filter and watermark logic are tested without the Android SDK. The Android module
// compiles the same sources; run with: gradle -p modules/sms-detector/jvm-test test
plugins {
  kotlin("jvm") version "2.1.21"
}

repositories {
  maven("https://repo1.maven.org/maven2")
  mavenCentral()
}


sourceSets {
  main { kotlin.srcDir("../android/src/main/java/app/budgetbrain/smsdetector/core") }
  test { kotlin.srcDir("../android/src/test/java/app/budgetbrain/smsdetector/core") }
}

dependencies { testImplementation("junit:junit:4.13.2") }
