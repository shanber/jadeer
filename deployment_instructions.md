# دليل إعداد وتشغيل منصة تقييم السير الذاتية - جدير (JADEER)

تم تصميم هذا التطبيق ليعمل في **وضع المحاكاة التجريبي (Local Mock Mode)** مباشرة بعد التثبيت دون الحاجة لأي إعدادات مسبقة. لتشغيله وربطه ببيئة عمل إنتاجية حقيقية (Production)، يرجى اتباع الخطوات التالية:

---

## 1. إعداد حساب Firebase

تستخدم المنصة خدمات Firebase لإدارة قواعد البيانات والملفات والتحقق من الهوية.

### خطوات إنشاء المشروع:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/) وسجل الدخول بحساب Google.
2. اضغط على **Add Project** وأنشئ مشروعاً جديداً باسم `jadeer-studio`.
3. اضغط على أيقونة الويب (`</>`) لإنشاء تطبيق ويب جديد داخل المشروع.
4. انسخ كود تهيئة التطبيق (Firebase Configuration Keys) لاستخدامه في ملف البيئة لاحقاً.

### أ) إعداد قاعدة البيانات Cloud Firestore:
1. من القائمة الجانبية، اختر **Firestore Database** ثم اضغط **Create Database**.
2. اختر الخادم القريب من منطقتك (مثال: `me-central1` في المملكة العربية السعودية أو `europe-west3`).
3. اختر وضع الإنتاج (Production Mode).
4. اذهب إلى تبويب **Rules** وضع القواعد الأمنية التالية:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null;
    }

    match /leads/{leadId} {
      allow create: if true;
      allow get: if true;
      allow list, update, delete: if isAdmin();
    }

    match /analytics/global_stats {
      allow read: if true;
      allow create, update: if true;
    }
  }
}
```

### ب) إعداد خدمة تخزين الملفات Firebase Storage:
1. من القائمة الجانبية، اختر **Storage** ثم اضغط **Get Started**.
2. حدد نفس موقع الخادم واضغط **Done**.
3. اذهب إلى تبويب **Rules** وضع القواعد التالية لتأمين خصوصية السير الذاتية وحصر قراءتها على الأدمن:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{leadId}/{allPaths=**} {
      // السماح بالرفع للجميع لدعم نموذج التقدم بدون تسجيل
      allow write: if request.resource.size < 10 * 1024 * 1024; // الحد الأقصى 10 ميجابايت
      // السماح بالقراءة للأدمن فقط
      allow read: if request.auth != null;
    }
  }
}
```

### ج) تفعيل التحقق من الهوية Firebase Authentication:
1. من القائمة الجانبية، اختر **Authentication** واضغط **Get Started**.
2. من تبويب **Sign-in method**، اختر تفعيل **Email/Password**.
3. اذهب إلى تبويب **Users** واضغط **Add User** لإضافة حساب الأدمن الخاص بفريق جدير (مثال: `admin@jadeer.sa` وكلمة مرور قوية).

---

## 2. الحصول على مفتاح Gemini API

1. اذهب إلى [Google AI Studio](https://aistudio.google.com/).
2. اضغط على **Get API Key**.
3. أنشئ مفتاحاً جديداً (Create API Key) وقم بنسخه.

---

## 3. إعداد البيئة المحلية (Environment Variables)

قم بإنشاء ملف باسم `.env.local` في المجلد الرئيسي للمشروع وضع فيه القيم التالية بعد ملئها:

```bash
# مفتاح الذكاء الاصطناعي Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# بيانات الاتصال بـ Firebase (من واجهة إعداد الويب بالمنصة)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# رقم الواتساب الرسمي لاستقبال طلبات التطوير (بدون + أو أصفار في البداية)
NEXT_PUBLIC_WHATSAPP_NUMBER=966500000000
```

---

## 4. التشغيل محلياً

افتح محطة الأوامر (Terminal) في مجلد المشروع ونفذ الأوامر التالية:

1. **تثبيت الحزم (إن لم تكن مثبتة):**
   ```bash
   npm install
   ```

2. **تشغيل خادم التطوير المحلي:**
   ```bash
   npm run dev
   ```
   سيكون الموقع متاحاً على الرابط: [http://localhost:3000](http://localhost:3000)

3. **تسجيل دخول الأدمن (في وضع المحاكاة أو الحقيقي):**
   - اذهب إلى: `/admin/login`
   - في وضع المحاكاة، الحساب الافتراضي هو: `admin@jadeer.sa` وكلمة المرور `jadeer2026`.
   - في الوضع الحقيقي، استخدم الحساب الذي أنشأته في خيار Authentication بالخطوة الأولى.

---

## 5. بناء التطبيق ونشره (Deployment)

التطبيق جاهز للنشر الفوري على منصات الاستضافة مثل **Vercel** أو **Netlify**:

1. اربط مستودع GitHub الخاص بك بمنصة **Vercel**.
2. أضف متغيرات البيئة المذكورة أعلاه في إعدادات النشر بـ Vercel (Environment Variables).
3. اضغط على **Deploy**؛ سيقوم خادم النشر ببناء التطبيق وإطلاقه تلقائياً.
