# 📱 Cara Reload App di Expo Go

## Metode 1: Shake HP (TERMUDAH)
1. Goyangkan HP Anda
2. Menu developer akan muncul
3. Tap "Reload"

## Metode 2: Tutup dan Buka Ulang
1. Tutup app di Expo Go (swipe close)
2. Buka Expo Go lagi
3. App SecureChat akan muncul di "Recently opened"
4. Tap untuk buka

## Metode 3: Manual Input URL
1. Buka Expo Go
2. Tap "Enter URL manually"
3. Ketik: `exp://192.168.1.4:8081`
4. Tap "Connect"

## Metode 4: Lihat QR Code di Browser
1. Buka browser di laptop
2. Buka: http://localhost:8081
3. QR code akan muncul di browser
4. Scan dengan Expo Go

## Jika Masih Error "Something went wrong"

### Coba ini:
1. **Uninstall Expo Go** dari HP
2. **Install ulang** dari Play Store
3. **Scan QR code** lagi

### Atau coba ini:
1. Di HP, tap "View error log"
2. Screenshot error-nya
3. Kirim ke saya untuk analisa

### Atau coba ini:
1. Pastikan laptop dan HP di **WiFi yang sama**
2. Cek IP laptop: `ipconfig` di CMD
3. Pastikan IP di terminal Expo sama dengan IP laptop

## Troubleshooting

### Error: "Unable to connect"
- Cek WiFi (laptop dan HP harus sama)
- Matikan VPN kalau ada
- Matikan Windows Firewall sementara

### Error: "Something went wrong"
- Biasanya ada bug di kode
- Lihat error log di HP
- Atau lihat terminal laptop ada error apa

### Error: "Project is incompatible"
- Expo Go perlu update
- Atau project perlu downgrade SDK

## Status Sekarang

- ✅ Expo SDK 51 (kompatibel dengan Expo Go 54)
- ✅ App.js sudah minimal (no dependencies)
- ✅ Server running di: exp://192.168.1.4:8081
- ⚠️ Masih error "Something went wrong" di HP

## Next Steps

1. Coba shake HP dan reload
2. Kalau masih error, screenshot error log
3. Atau coba uninstall/install ulang Expo Go
