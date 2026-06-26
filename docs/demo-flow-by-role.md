# Flow Demo Aplikasi Kumpul.in Berdasarkan Role Pengguna

Dokumen ini merangkum alur yang perlu didemokan kepada stakeholder berdasarkan fitur yang tersedia pada aplikasi saat ini.

Role utama yang ada di aplikasi:

- Guest / Pengunjung
- User / Peserta
- Organizer

Catatan: belum terlihat role admin atau backoffice pada aplikasi frontend saat ini.

## 1. Guest / Pengunjung

Tujuan demo: menunjukkan proses discovery platform sebelum pengguna login.

### Flow Demo

1. Buka landing page `/`.
2. Tunjukkan section utama:
   - rekomendasi event
   - kategori populer
   - upcoming events
   - call to action
3. Masuk ke halaman daftar event `/events`.
4. Demo fitur pencarian dan filter event:
   - search keyword
   - kategori
   - lokasi/provinsi
   - harga gratis/berbayar
   - sorting
5. Buka detail event `/events/[slug]`.
6. Tunjukkan informasi event:
   - banner/foto event
   - deskripsi event
   - jadwal event
   - lokasi offline atau online meeting
   - rundown
   - daftar tiket
   - kuota tiket
   - countdown periode registrasi
7. Klik tombol beli tiket saat belum login.
   - Expected result: user diarahkan ke `/login`.
8. Buka profil organizer publik `/organizer/[slug]`.
9. Tunjukkan informasi profil organizer:
   - nama dan deskripsi organizer
   - statistik pengikut
   - total event
   - total peserta
   - rating dan ulasan
   - event mendatang
   - event selesai
10. Buka halaman komunitas publik `/komunitas`.
11. Tunjukkan feed post terbaru dari komunitas.
12. Buka detail komunitas dan detail post.
13. Tunjukkan isi post dan komentar.

## 2. User / Peserta

Tujuan demo: menunjukkan end-to-end flow pembelian tiket sampai e-ticket dapat digunakan untuk check-in.

### Flow Demo

1. Login sebagai user di `/login`.
2. Jika akun belum lengkap, demo onboarding `/get-started`:
   - isi nomor telepon
   - pilih role `Pengguna`
   - verifikasi email OTP
3. Masuk ke halaman daftar event `/events`.
4. Cari event yang registrasinya sedang dibuka.
5. Buka detail event.
6. Demo aksi user pada detail event:
   - pilih kategori tiket
   - ubah jumlah tiket
   - tambah event ke wishlist
   - hapus event dari wishlist
   - share event
7. Klik `Beli Tiket` atau `Daftar Sekarang`.
8. Sistem membuat order dan mengarahkan user ke `/checkout/[order_id]`.
9. Di halaman checkout, tunjukkan:
   - data pembeli yang terisi otomatis dari profil
   - pilihan metode pembayaran
   - ringkasan pesanan
10. Lanjutkan ke halaman pembayaran `/payment/[order_id]`.
11. Di halaman pembayaran, tunjukkan:
   - timer pembayaran
   - instruksi pembayaran
   - metode pembayaran yang dipilih
   - status sandbox payment
12. Klik `Simulasi Bayar Sekarang`.
    - Expected result: order menjadi paid dan tiket dibuat oleh backend.
13. Masuk ke halaman `/user/my-ticket`.
14. Tunjukkan daftar tiket:
   - tiket aktif
   - tiket sudah check-in
   - filter status
   - pagination
   - tombol tampilkan QR
15. Buka detail tiket `/user/my-ticket/[ticket_id]`.
16. Tunjukkan detail e-ticket:
   - QR ticket
   - nomor tiket
   - kategori tiket
   - informasi peserta
   - jadwal event
   - status check-in
17. Buka halaman `/user/wishlist`.
18. Tunjukkan fitur wishlist:
   - daftar event yang disimpan
   - filter wishlist
   - hapus event dari wishlist
   - buka detail event dari wishlist
19. Buka halaman `/user/following`.
20. Tunjukkan fitur following organizer:
   - daftar organizer yang diikuti
   - search organizer
   - buka profil organizer
   - unfollow organizer
21. Buka halaman `/user/profile`.
22. Tunjukkan pengelolaan profil:
   - edit username
   - edit nomor telepon
   - edit nama depan dan nama belakang
   - upload foto profil
   - hapus foto profil
   - ubah password
   - reset password

## 3. Organizer

Tujuan demo: menunjukkan lifecycle organizer dari onboarding, membuat event, mengelola event, membangun komunitas, sampai check-in peserta.

### Flow Demo

1. Login sebagai organizer.
2. Jika akun belum lengkap, demo onboarding `/get-started`:
   - isi nomor telepon
   - pilih role `Organizer`
   - isi nama organizer
   - verifikasi email OTP
   - masuk ke `/organizer/dashboard`
3. Buka dashboard organizer `/organizer/dashboard`.
4. Tunjukkan statistik ringkas organizer.
5. Buka profil organizer `/organizer/profile`.
6. Demo pengelolaan profil organizer:
   - edit nama organizer
   - edit deskripsi organizer
   - upload banner
   - upload foto profil
   - lihat tab ulasan
7. Buka halaman buat event `/organizer/create-event`.
8. Demo step pembuatan event:
   - Step 1: pilih tipe event
   - Step 2: isi informasi event, kategori, deskripsi, banner, dan foto
   - Step 3: isi jadwal event, periode registrasi, lokasi atau online meeting, dan rundown
   - Step 4: buat kategori tiket, harga, kuota, dan batas pembelian
   - Step 5: preview event sebelum submit
9. Submit event.
   - Expected result: event dibuat sebagai draft dan user diarahkan ke daftar event.
10. Buka halaman `/organizer/my-event`.
11. Tunjukkan daftar event organizer:
   - search event
   - filter status event
   - kartu event dengan status dan ringkasan tiket
12. Buka detail event organizer `/organizer/my-event/[id]`.
13. Tunjukkan detail event organizer:
   - core info
   - banner event
   - status event
   - lokasi
   - rundown
   - jadwal
   - kapasitas
   - kategori tiket
   - total booked
14. Demo edit event per section:
   - edit informasi utama
   - edit jadwal
   - edit lokasi
   - edit rundown
   - edit tiket
15. Buka halaman check-in `/organizer/check-in`.
16. Tunjukkan daftar event untuk check-in:
   - event aktif
   - total tiket
   - jumlah peserta hadir
   - progress check-in
17. Buka detail check-in `/organizer/check-in/[eventId]`.
18. Demo validasi tiket:
   - mode QR scanner
   - fallback manual code
   - hasil validasi sukses
   - hasil validasi gagal
19. Tunjukkan tab riwayat check-in.
20. Tunjukkan tab daftar partisipan:
   - nama peserta
   - nomor tiket
   - kategori tiket
   - status kehadiran
21. Buka halaman komunitas organizer `/organizer/communities`.
22. Jika organizer belum punya komunitas:
   - tunjukkan empty state
   - klik buat komunitas
23. Buka `/organizer/communities/create`.
24. Demo pembuatan komunitas:
   - upload banner
   - upload logo
   - isi nama komunitas
   - isi slug
   - isi deskripsi
   - isi peraturan komunitas
25. Setelah komunitas dibuat, kembali ke `/organizer/communities`.
26. Tunjukkan ringkasan komunitas:
   - nama komunitas
   - slug
   - deskripsi
   - jumlah anggota
   - jumlah event
   - jumlah postingan
   - aksi buka halaman publik
27. Buka edit komunitas `/organizer/communities/[communityId]/edit`.
28. Demo pengelolaan komunitas:
   - ubah banner
   - ubah logo
   - edit nama komunitas
   - edit slug
   - edit deskripsi
   - edit peraturan
29. Tunjukkan opsi hapus komunitas sebagai flow risiko.
   - Catatan: untuk demo stakeholder, cukup tampilkan dialog konfirmasi. Tidak perlu benar-benar menghapus komunitas.

## Flow Demo Utama Untuk Stakeholder

Urutan berikut adalah flow paling kuat untuk menunjukkan value end-to-end aplikasi.

1. Guest menemukan event dari landing page atau daftar event.
2. Guest membuka detail event dan mencoba membeli tiket.
3. Guest diarahkan login.
4. User login dan melanjutkan pembelian tiket.
5. User memilih tiket dan membuat order.
6. User checkout dan memilih metode pembayaran.
7. User melakukan simulasi pembayaran.
8. Sistem menghasilkan e-ticket.
9. User membuka QR ticket di halaman `Tiket Saya`.
10. Organizer membuka halaman check-in event.
11. Organizer melakukan validasi QR atau manual code.
12. Sistem menandai tiket sebagai sudah check-in.
13. Organizer melihat riwayat check-in dan daftar partisipan.
14. User melihat status tiket berubah menjadi sudah check-in.
15. Organizer menunjukkan komunitas sebagai channel engagement setelah event.

## Halaman Yang Tidak Disarankan Untuk Demo Utama

Halaman berikut ada di aplikasi, tetapi saat ini belum menjadi flow utama karena masih sangat sederhana atau placeholder:

- `/user/account`
- `/organizer/account`

Sebaiknya dua halaman tersebut tidak dimasukkan ke demo stakeholder kecuali hanya disebutkan sebagai area pengembangan berikutnya.

## Checklist Persiapan Demo

Sebelum demo, siapkan data berikut:

- Akun guest tidak diperlukan.
- Akun user dengan profil lengkap.
- Akun organizer dengan profil lengkap.
- Minimal satu event published dengan registrasi sedang dibuka.
- Minimal satu kategori tiket dengan kuota tersedia.
- Minimal satu order yang bisa dibayar melalui sandbox.
- Minimal satu tiket aktif dengan QR code.
- Minimal satu event yang muncul di halaman check-in organizer.
- Minimal satu komunitas organizer, atau siapkan flow pembuatan komunitas dari awal.
- Pastikan kamera browser diizinkan jika ingin demo QR scanner.
- Siapkan fallback manual code jika kamera tidak tersedia saat presentasi.

