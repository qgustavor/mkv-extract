const e={main:{name:"MKV Extract",description:"استخراج ملفات MKV عبر الإنترنت، مباشرة من متصفحك","file-count":"{count, plural, =0 {انقر أو اسقط الملفات هنا لاستخراجها} =1 {تم فتح ملف واحد} other {تم فتح # ملفات}}","automatic-mode":"الوضع التلقائي","manual-mode":"الوضع اليدوي","automatic-mode-explained":"سيتم استخراج التدفقات (مثل الترجمة والمرفقات) وضغطها بناءً على الفلاتر المحددة في الإعدادات.","manual-mode-explained":"ستظهر قائمة بالتدفقات (مثل الترجمة والمرفقات) بعد فتح الملفات، مع التفضيل للإعدادات المحددة{folderEnabled, select, true {، ثم يمكنك الاختيار بين استخراجها إلى ملف مضغوط أو مجلد.} other {}}.","file-loading":"يرجى الانتظار بينما {count, plural, =1 {يتم تحميل الملف} other {يتم تحميل الملفات}}","zip-select":"استخراج إلى ملف مضغوط","folder-select":"استخراج إلى مجلد","folder-select-tooltip":"يرجى عدم تحديد مجلد التنزيلات أو المجلدات النظامية أو أي مجلد آخر قد يحتوي على محتوى حساس للخصوصية."},streams:{"no-selected-closed":"لم يتم تحديد أي تدفقات، انقر على التدفقات لتحديدها","no-selected-open":"لم يتم تحديد أي تدفقات، انقر هنا لتحديد التدفقات",selected:"{count, plural, =1 {تم تحديد تدفق واحد} other {تم تحديد # تدفقات}}","metadata-name":"{count, plural, =0 {بيانات الملف والتدفقات} =1 {بيانات الملف، التدفقات والفصول} other {بيانات الملف، التدفقات والفصول}}"},status:{loading:"جارٍ معالجة {count, plural, =1 {الملف} other {الملفات}}...","extraction-pending":"بانتظار بدء الاستخراج",extracting:"جارٍ الاستخراج...",finished:"اكتمل الاستخراج",skipped:"تم تخطي الاستخراج","load-error":"تعذر تحميل الملف","extraction-error":"تعذر استخراج التدفقات","partial-extraction-error":"تعذر استخراج بعض التدفقات"},header:{"home-page":"الصفحة الرئيسية",settings:"الإعدادات",help:"مساعدة",classic:"كلاسيكي","color-scheme":"تغيير نظام الألوان",download:"تحقق من mkvextract الأصلي",github:"تحقق من المشروع على GitHub",locale:"الترجمات"},locales:{en:"English",pt:"Português/Portuguese",zh:"中文/Mandarin Chinese",es:"Español/Spanish",ar:"العربية",fr:"Français/الفرنسية"},settings:{title:"الإعدادات",description:"تغيير إعدادات استخراج الملفات",subtitle_extraction_mode:"وضع استخراج الترجمة",all_subtitles:"استخراج جميع الترجمات",lang_subtitles:"استخراج الترجمات حسب اللغة",skip_subtitles:"تخطي الترجمات",subtitle_languages:"لغات الترجمة المصفاة",subtitle_languages_helper:"أدخل رموز اللغات المكونة من 3 أحرف مفصولة بمسافة (مثل: eng، cmn، hin، spa، fra)",attachment_extraction_mode:"وضع استخراج المرفقات",all_attachments:"استخراج جميع المرفقات",skip_attachments:"تخطي المرفقات",metadata_extraction_mode:"وضع استخراج البيانات الوصفية",json_metadata:"استخراج البيانات الوصفية في ملف .json",skip_metadata:"تخطي البيانات الوصفية",video_extraction_mode:"وضع استخراج الفيديو",all_video:"استخراج جميع الفيديوهات",skip_video:"تخطي الفيديو",audio_extraction_mode:"وضع استخراج الصوت",all_audio:"استخراج جميع المسارات الصوتية",skip_audio:"تخطي الصوت",subtitle_file_template:"قالب ملف الترجمة",attachment_file_template:"قالب ملف المرفقات",metadata_file_template:"قالب ملف البيانات الوصفية",video_file_template:"قالب ملف الفيديو",audio_file_template:"قالب ملف الصوت",file_collision_mode:"وضع تصادم الملفات",rename_files:"إعادة تسمية الملفات المتصادمة",skip_collisions:"تخطي الملفات المتصادمة",reset_options:"استعادة الخيارات الافتراضية",info:"معلومات",stream_containers_info:"سيتم استخراج التدفقات باستخدام حاوياتها الخاصة عند الإمكان، وإلا سيتم المحاولة باستخدام حاوية MP4/M4A للتدفق الفردي، وإلا سيتم استخدام حاوية MKV/MKA للتدفق الفردي.",file_format_placeholders_title:"نائب تنسيق الملف المدعوم",filename_placeholder:"اسم الملف",filename_no_ext_placeholder:"اسم الملف بدون امتداد",track_name_placeholder:"اسم المسار",track_number_placeholder:"رقم المسار: TrackNumber",language_placeholder:"لغة المسار (رمز مكون من 3 أحرف)",attachment_filename_placeholder:"اسم ملف المرفق",folder_creation_placeholder:"يمكنك استخدام '/' لإنشاء مجلدات"},help:{title:"مساعدة",description_part1:"تستخدم هذه التطبيق الويب",description_link_text:"تطبيق WASM من FFmpeg",description_part2:"لاستخراج التدفقات من ملفات الفيديو. ملاحظة: تم تقديم هذه الترجمة بواسطة آلة ويمكنك المساعدة في هذا المشروع من خلال الذهاب إلى GitHub وتقديم تصحيحات للمشاكل في هذه الترجمة.",experiment_description:"بدأ هذا المشروع كتجربة لتوفير وسيلة لعرض ملفات Matroska في المتصفحات عن طريق استخراج تدفقاتها وإعادة تجميعها في حاويات MP4 (بشكل رسمي ISO/IEC 14496-14:2003) حيث في ذلك الوقت لم تدعم معظم المتصفحات عرض الفيديوهات باستخدام حاوية Matroska ولكن سمحت للفيديوهات التي استخدمت حاوية MP4.",abandoned_project_note:"تم في النهاية التخلي عن المشروع، ولكن نظرًا لأن جزء الاستخراج بدا مفيدًا تم إنشاء هذا الإصدار الذي يستخدم FFmpeg كأساس. الآن يدعم استخراج المزيد من أنواع التدفقات، ولديه المزيد من الخيارات ويدعم أيضًا استخراج التدفقات من ملفات MP4."},faq:{title:"الأسئلة الشائعة",why_javascript:"لماذا يتطلب JavaScript؟",javascript_explanation:"لأنه لا يتم تحميل أي ملف على أي خادم، يعمل التطبيق بالكامل في المتصفح.",why_no_url:"لماذا لا يوجد دعم لتحديد URL؟",no_url_explanation_part1:"لأنه يعمل في المتصفح وفي معظم الحالات لا يمكن للصفحات الوصول إلى محتويات صفحات أخرى (راجع ",no_url_explanation_link_text:"سياسة نفس الأصل",no_url_explanation_part2:") لذا فإن تنفيذ طريقة لاستخراج الملفات من عناوين URL للحالات النادرة حيث تسمح المواقع الأخرى بالوصول إلى محتوياتها ليس مجديًا.",why_not_working:"لماذا لا يعمل بعض ملفاتي؟",not_working_explanation:"هذا المشروع قيد العمل. راجع سجل الأخطاء وإذا كنت تعتقد حقًا أن المشكلة في التطبيق وليست في ملفك التالف، افتح مشكلة في GitHub.",why_mp4_mkv:"لماذا يتم استخراج بعض التدفقات إلى ملفات MP4 أو MKV؟",mp4_mkv_explanation:"لتقليل أحجام بنى FFmpeg، لا يتضمن الحزم لبعض التنسيقات مثل H264 و H265. إذا كنت تعتقد أنه من المفيد تضمين معين، افتح مشكلة في GitHub.",why_not_downloads:"لماذا لا يمكنني الاستخراج إلى مجلد التنزيلات؟",not_downloads_explanation_part1:'لأنه إذا سمحت بالوصول إلى مجلد التنزيلات لأي موقع قد يحاول قراءة تنزيلاتك وتسريب بياناتك، ولسوء الحظ فإن المواصفات الحالية للأداة التي تتعامل معها ليس لديها أي آلية لتجنب ذلك سوى حظر الوصول بالكامل إلى ذلك المجلد. أنشئ مجلدًا جديدًا واستخدمه بدلاً من ذلك. بالمناسبة، فإن Firefox والعديد من المتصفحات الأخرى لا تنفذ تلك الأداة لأنه، كما قد تتوقع، على الرغم من فائدتها للمطورين، فإنها تفتح علبة الديدان الأمنية. أيضًا، يقوم Chromium بحظر الحرف "~" من أسماء الملفات حتى إذا ',not_downloads_explanation_link_text:"لم يكن حرفًا محجوزًا في معظم أنظمة الملفات",not_downloads_explanation_part2:"، وهو أمر غريب حقًا وتم التعامل معه في هذا التطبيق.",why_ffmpeg:"لماذا FFmpeg؟",ffmpeg_explanation:"كانت الخطة الأصلية هي أخذ شفرة mkvextract الأصلية وتجميعها إلى WASM، ولكن استخدام FFmpeg بدا أسهل نظرًا لوجود بعض تطبيقات WASM منه بالفعل.",why_corporate:"لماذا يبدو هذا التصميم تجاريًا للغاية؟",corporate_explanation:"لأنه تصميم IBM's Carbon: كنت أبحث عن مكتبة مكونات Svelte مع الكثير من المكونات ووضع الظلام، كما أنني كنت متعبًا من تصميم Material، لذا اخترت هذا."}};export{e as default};