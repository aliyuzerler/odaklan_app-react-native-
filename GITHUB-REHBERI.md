# GitHub'a Yükleme Rehberi (Manuel)

Projeyi kendi elinle GitHub'a yüklemek için adım adım rehber. Terminal olarak **Git Bash** kullan (sağ tık → Git Bash Here, veya VS Code terminali).

---

## Adım 0 — Ön Koşullar

- Git kurulu (Git Bash ile birlikte gelir) → kontrol: `git --version`
- [github.com](https://github.com) hesabı açık ve **oturumunda** ol

---

## Adım 1 — GitHub'da Boş Depo Oluştur

1. GitHub'da sağ üstteki **+** → **New repository**
2. Alanları doldur:
   - **Repository name:** `takip-asistan`
   - **Description:** (isteğe bağlı) "Günlük 3 hedef + Pomodoro odak asistanı — Expo / React Native"
   - **Public** veya **Private** (senin seçimin)
3. ⚠️ **Şu üç kutucuğu İŞARETLEME:**
   - ~~Add a README file~~
   - ~~Add .gitignore~~
   - ~~Choose a license~~

   Projede üçü de zaten var; işaretlersen çakışma olur.
4. **Create repository** → açılan sayfadaki `https://github.com/KULLANICIADI/takip-asistan.git` adresini kopyala. Sonraki adımlarda `KULLANICIADI` yazan yerlere kendi kullanıcı adını yaz.

---

## Adım 2 — Değişiklikleri Hazırla (proje klasöründe)

Git Bash'i proje klasöründe aç ve sırayla:

```bash
cd C:/Users/90553/Desktop/takip_asistan

# Yüklenecekleri gözden geçir (node_modules, android/, .zcode görünmemeli)
git status

# Tüm dosyaları sahneye al
git add .

# İlk anlamlı commit
git commit -m "Takip Asistan: 3 hedef, Pomodoro, istatistik, rozetler, reklamlar"
```

> `git status` çıktısında `android/`, `node_modules/`, `dist/`, `.zcode/` **görmemelisin** — `.gitignore` bunları hariç tutuyor, doğru olan budur (repo sadece kaynak koddan oluşur).

---

## Adım 3 — Dal Adını `main` Yap

Şablon `master` ile kuruldu; GitHub'ın varsayılanı `main`:

```bash
git branch -M main
```

---

## Adım 4 — GitHub'ı Uzak Depo Olarak Bağla

```bash
git remote add origin https://github.com/KULLANICIADI/takip-asistan.git

# Doğrula — "origin ... (fetch/push)" satırlarını görmelisin
git remote -v
```

---

## Adım 5 — Yükle (Push)

```bash
git push -u origin main
```

**Kimlik doğrulama penceresi açılır:**
- Windows'ta **Git Credential Manager** ilk seferde bir tarayıcı penceresi açar → GitHub'a giriş yap → **Authorize** → biter. En kolay yol budur.
- Tarayıcı açılmazsa terminalde kullanıcı adı + **şifre değil**, **Personal Access Token** ister: GitHub → Settings → Developer settings → Personal access tokens → **Generate new token (classic)** → `repo` yetkisi ver → ürettiğin token'ı şifre alanına yapıştır. (Token bir kez sorulur, Windows saklar.)

Başarıda şöyle bir çıktı görürsün:

```
Enumerating objects: ...
To github.com:KULLANICIADI/takip-asistan.git
 * [new branch]      main -> main
```

Tarayıcıda `github.com/KULLANICIADI/takip-asistan` açıp kontrol et. 🎉

---

## Sonraki Değişikliklerde

Kod değiştirince tekrarlayan döngü şu üç komuttur:

```bash
git add .
git commit -m "ne değiştiğini özetle"
git push
```

---

## Faydalı Kontroller

```bash
git log --oneline        # commit geçmişi
git status               # bekleyen değişiklikler
git diff                 # değişen satırlar
git remote -v            # bağlı uzak depo
```

---

## Başka Bir Bilgisayarda Projeyi Açmak

```bash
git clone https://github.com/KULLANICIADI/takip-asistan.git
cd takip-asistan
npm install
npx expo start
```

Native klasörler (`android/`) repoda olmadığı için ilk Android derlemesi `npx expo run:android` ile otomatik üretilir. Ayrıca `android/gradle.properties` içindeki `reactNativeArchitectures=arm64-v8a` ayarı CNG ile silinir — gerçek cihaz testinden önce yeniden ekle (bkz. README).

---

## Güvenlik Notları

- Repodaki `google-services.json` ve `GoogleService-Info.plist` **yer tutucu** (placeholder) dosyalar; gerçek anahtar içermez. Gerçek Firebase dosyalarını eklediğinde de git'e girebilir — bu dosyalar istemci tarafında zaten herkese açıktır, secret sayılmaz. Yine de üretim anahtarlarını ayrı (private) repoda tutmak temiz tercih.
- AdMob ID'leri `src/lib/ads.ts` ve `app.config.ts` içinde; yayın öncesi gerçek ID'lerini koyduğunda bunlar da repoya girer — sorun değil, AdMob uygulama/birim ID'leri gizli değildir.
- Repoyu **Public** yaptıysan: hiçbir gerçek API secret, şifre veya token koymadığından emin ol (bu projede yok).
