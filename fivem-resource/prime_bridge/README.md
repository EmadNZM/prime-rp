# PRIME RP FiveM Web Bridge Resource (`prime_bridge`)

هذا الريسورس الرسمي المعتمد لربط سيرفر FiveM بموقع ومنصة **PRIME RP** تلقائياً بصورة مشفرة وآمنة تماماً.

### المميزات (Features)
- تحديث تلقائي وفوري لحالة السيرفر وعدد اللاعبين الفعليين المتصلين لحظة بلحظة.
- جلب قائمة اللاعبين المتصلين الحقيقيين وتحديث صفحة `/players` تلقائياً بدون أرقام وهمية.
- دعم قراءة الشخصيات والأموال والوظائف تلقائياً لأنظمة **QBCore** و **ESX** الشهيرة.
- اتصال مشفر ومحمي برمز سري `X-FiveM-Bridge-Token` لمنع التلاعب أو التزوير.

---

### طريقة التركيب (Installation)

1. انقل مجلد `prime_bridge` إلى مسار الريسورسز في سيرفرك:
   ```bash
   [resources]/prime_bridge
   ```
2. في ملف إعدادات السيرفر `server.cfg`، أضف السطور التالية:
   ```cfg
   # إعدادات ربط موقع PRIME RP
   set prime_web_url "https://prime-rp.onrender.com"
   set prime_bridge_token "YOUR_SECRET_BRIDGE_TOKEN_HERE"

   # تشغيل الريسورس
   ensure prime_bridge
   ```
3. في ملف `.env` الخاص بموقع PRIME RP، تأكد من مطابقة نفس الرمز:
   ```env
   FIVEM_BRIDGE_TOKEN=YOUR_SECRET_BRIDGE_TOKEN_HERE
   ```
4. أعد تشغيل السيرفر أو اكتب في وحدة تحكم السيرفر (F8/Console):
   ```
   refresh
   start prime_bridge
   ```
سيقوم السيرفر بالمزامنة التلقائية مع الموقع كل 30 ثانية وتغذية صفحات اللاعبين ولوحة الشرف الحقيقية فورياً.
