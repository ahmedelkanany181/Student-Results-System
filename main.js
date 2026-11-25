// قائمة حفظ جميع الطلاب
const studentsList = [];

// كلاس الطالب مع استخدام التغليف (Encapsulation) والحقول الخاصة
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("من فضلك أدخل اسم الطالب.");
    }

    this.#name = name.trim();
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // دالة تحقق مشتركة للتأكد من أن القيمة موجودة ورقمها صحيح بين 0 و100
  validatePercentage(value, fieldName) {
    if (value === "" || value === null || value === undefined) {
      throw new Error(`حقل ${fieldName} مطلوب ولا يمكن تركه فارغًا.`);
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 100) {
      throw new Error(`يجب أن تكون قيمة ${fieldName} رقمًا من 0 إلى 100.`);
    }

    return numberValue;
  }

  // Setters لحماية درجات المواد
  set grade1(value) {
    this.#grade1 = this.validatePercentage(value, "المادة الأولى");
  }

  set grade2(value) {
    this.#grade2 = this.validatePercentage(value, "المادة الثانية");
  }

  set grade3(value) {
    this.#grade3 = this.validatePercentage(value, "المادة الثالثة");
  }

  // Setter لحماية نسبة الحضور
  set attendance(value) {
    this.#attendance = this.validatePercentage(value, "نسبة الحضور");
  }

  // Getters لقراءة البيانات الخاصة
  get name() {
    return this.#name;
  }

  get grade1() {
    return this.#grade1;
  }

  get grade2() {
    return this.#grade2;
  }

  get grade3() {
    return this.#grade3;
  }

  get attendance() {
    return this.#attendance;
  }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

// الإمساك بعناصر الصفحة باستخدام getElementById
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const studentsListBox = document.getElementById("studentsList");
const studentCount = document.getElementById("studentCount");
const mercyBtn = document.getElementById("mercyBtn");
const reportBox = document.getElementById("reportBox");

// عرض رسالة الخطأ داخل الصفحة بدلًا من الكونسول
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}

// تحديث قائمة الطلاب على الشاشة
function renderStudents() {
  studentCount.textContent = `${studentsList.length} طالب`;

  if (studentsList.length === 0) {
    studentsListBox.innerHTML = '<div class="empty-state">لم تتم إضافة أي طلاب حتى الآن.</div>';
    return;
  }

  studentsListBox.innerHTML = studentsList.map((student, index) => `
    <article class="student-item">
      <div>
        <div class="student-name">${index + 1}. ${escapeHTML(student.name)}</div>
        <div class="student-meta">
          الدرجات: ${student.grade1}، ${student.grade2}، ${student.grade3}
          — الحضور: ${student.attendance}%
        </div>
      </div>
      <div class="student-average">المتوسط: ${student.average.toFixed(2)}</div>
    </article>
  `).join("");
}

// حماية أسماء الطلاب عند عرضها داخل HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// إضافة طالب جديد عند إرسال النموذج
studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  try {
    // أخذ القيم من حقول الإدخال
    const name = studentNameInput.value;
    const grade1 = grade1Input.value;
    const grade2 = grade2Input.value;
    const grade3 = grade3Input.value;
    const attendance = attendanceInput.value;

    // إنشاء كائن جديد؛ الـ setters ستتحقق من صحة الدرجات والحضور
    const student = new Student(name, grade1, grade2, grade3, attendance);

    // حفظ الطالب وتحديث القائمة
    studentsList.push(student);
    renderStudents();

    // تفريغ الحقول بعد نجاح الإضافة
    studentForm.reset();
    reportBox.innerHTML = '<div class="empty-state">تمت إضافة طالب جديد. اضغط على زر لجنة الرأفة لتحديث التقرير.</div>';
    studentNameInput.focus();
  } catch (error) {
    showError(error.message);
  }
});

// لجنة الرأفة باستخدام Filter وMap وReduce
mercyBtn.addEventListener("click", () => {
  clearError();

  // Filter: استخراج الطلاب الذين متوسط درجاتهم من 40 إلى 49 شاملًا
  const strugglingStudents = studentsList.filter((student) => {
    return student.average >= 40 && student.average <= 49;
  });

  if (strugglingStudents.length === 0) {
    reportBox.innerHTML = `
      <div class="empty-state">
        لا يوجد طلاب متوسط درجاتهم بين 40 و49، لذلك لا توجد حالات تحتاج إلى لجنة الرأفة.
      </div>
      <div class="mt-3 fw-bold">عدد الطلاب المتعثرين: 0</div>
    `;
    return;
  }

  // Map: إضافة 5 درجات رأفة إلى متوسط كل طالب مستخرج
  const studentsAfterMercy = strugglingStudents.map((student) => ({
    name: student.name,
    oldAverage: student.average,
    newAverage: student.average + 5
  }));

  // Reduce: جمع المتوسطات الجديدة
  const totalAfterMercy = studentsAfterMercy.reduce((total, student) => {
    return total + student.newAverage;
  }, 0);

  // حساب المتوسط العام مع منع القسمة على صفر
  const generalAverage = studentsAfterMercy.length > 0
    ? totalAfterMercy / studentsAfterMercy.length
    : 0;

  // تجهيز أسماء الطلاب وعرض التقرير باستخدام Template Literals
  const namesHTML = studentsAfterMercy.map((student) => `
    <li>
      <strong>${escapeHTML(student.name)}</strong>
      — المتوسط قبل الرأفة: ${student.oldAverage.toFixed(2)}
      — بعد الرأفة: <strong>${student.newAverage.toFixed(2)}</strong>
    </li>
  `).join("");

  reportBox.innerHTML = `
    <div class="report-summary">
      <div class="report-stat">
        <span>عدد الطلاب المتعثرين</span>
        <strong>${studentsAfterMercy.length}</strong>
      </div>
      <div class="report-stat">
        <span>المتوسط العام بعد الرأفة</span>
        <strong>${generalAverage.toFixed(2)}</strong>
      </div>
    </div>
    <h3 class="h6 fw-bold mb-2">أسماء الطلاب ونتائجهم بعد الرأفة</h3>
    <ol class="report-names">${namesHTML}</ol>
  `;
});
