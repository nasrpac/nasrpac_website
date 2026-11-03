/* =========================================================
   NASRPAC — Two-Section Interaction Layer
   ========================================================= */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const I18N = {
    en: {
      "skip":"Skip to content",
      "nav.process":"Our process", "hs.all":"All capabilities",
      "tab.1":"Print", "tab.2":"Laminate", "tab.3":"Convert", "tab.4":"Finish", "tab.5":"Quality",
      "hs.1.ph":"Render · Print hall — offset presses", "hs.2.ph":"Render · Lamination line", "hs.3.ph":"Render · Die-cutting & converting", "hs.4.ph":"Render · Folding & gluing line", "hs.5.ph":"Render · Quality laboratory",
      "hs.1.a":"Four-colour offset printing", "hs.1.b":"Spot UV & soft-touch finishes",
      "hs.2.a":"E & F flute litho lamination", "hs.2.b":"Moisture resistance for frozen goods",
      "hs.3.a":"Die cutting & embossing", "hs.3.b":"Window patching",
      "hs.4.a":"Folding & gluing — square, ready to fill", "hs.4.b":"Riptape & teartape",
      "hs.5.a":"On-site laboratory", "hs.5.b":"Waste-water recycling",
      "tab.6":"Deliver", "hs.6.ph":"Render · Dispatch yard", "hs.6.a":"Loaded at our own docks", "hs.6.b":"Delivered across the GCC",
      "nav.capabilities":"Capabilities", "nav.industries":"Industries", "nav.story":"Our story", "nav.quality":"Quality", "nav.quote":"Quote",
      "cta.quote":"Request a quote", "cta.capabilities":"See capabilities",
      "hero.kicker":"NASR PACKAGING & PRINTING CO. · JEDDAH",
      "hero.t1":"Five decades", "hero.t2":"of", "hero.t3":"precision.",
      "hero.lede":"Folding cartons, offset printing and converted board — engineered in Al-Khumrah, Jeddah since 1973 for food, pharmaceutical and FMCG partners across the GCC.",
      "hero.tag":"drag to rotate",
      "mq.1":"Offset printing", "mq.2":"UV & special effects", "mq.3":"Hot foil stamping", "mq.4":"Litho lamination", "mq.5":"Die cutting", "mq.6":"Window patching", "mq.7":"Folding & gluing",
      "ph.facility":"Photo · Production floor, Al-Khumrah", "ph.food":"Photo · Food cartons", "ph.pharma":"Photo · Pharma cartons", "ph.household":"Photo · Household packaging", "ph.story":"Photo · Archive, 1970s", "ph.lab":"Photo · Quality lab",
      "story.y2":"50+ yrs", "story.y3":"Today", "val.label":"Core values", "f.head":"Request for quotation",
      "hero.scroll":"SCROLL TO EXPLORE",
      "line.kicker":"MANUFACTURING IN MOTION",
      "line.t1":"From flat sheet", "line.t2":"to", "line.t3":"finished carton.",
      "stat.founded":"Founded", "stat.facility":"Facility", "stat.capacity":"Capacity", "stat.location":"Location",
      "intro.eyebrow":"01 / A different kind of partner",
      "intro.note":"Good packaging does more than protect a product. It earns attention, carries a promise, and gets every detail right.",
      "intro.title":"The first touchpoint.<br>The last detail.<br><em>Every part matters.</em>",
      "intro.p1":"Since 1973 Nasrpac has built a reputation for innovative, high-quality and sustainable packaging — trusted by leading local, regional and multinational brands.",
      "intro.p2":"Family-driven leadership continues the founder's vision. Craft and capability work together: material knowledge, production discipline and attention to detail.",
      "intro.link":"Our story",
      "cap.eyebrow":"02 / What we make possible",
      "cap.title":"One connected process.<br><em>Many ways forward.</em>",
      "cap.lede":"Eleven manufacturing capabilities under one roof. Integrated thinking across print, lamination, converting and finishing.",
      "pillar.1.name":"Offset, UV & foil.", "pillar.1.a":"Offset printing", "pillar.1.b":"UV & special effects", "pillar.1.c":"Hot foil stamping",
      "pillar.1.body":"High-fidelity imagery and colour consistency verified against an approved proof. Spot UV, full-coat, textured and soft-touch finishes.",
      "pillar.2.name":"Structural board.", "pillar.2.a":"E & F flute litho", "pillar.2.b":"Single facer corrugated",
      "pillar.2.body":"Engineered for structural integrity and maximum protection of heavier retail products, with moisture resistance for frozen goods.",
      "pillar.3.name":"Shaped with precision.", "pillar.3.a":"Die cutting & embossing", "pillar.3.b":"Guillotine cutting", "pillar.3.c":"Window patching",
      "pillar.3.body":"Precision shaping and tactile branding to enhance the unboxing experience. Automated cutting for exacting dimensional accuracy.",
      "pillar.4.name":"Ready for the line.", "pillar.4.a":"Folding & gluing", "pillar.4.b":"Riptape & teartape", "pillar.4.c":"Clamshell packaging",
      "pillar.4.body":"Advanced final assembly ensuring structural perfection — square, ready for automated filling lines.",
      "ind.eyebrow":"03 / Industry solutions", "ind.title":"Engineered for<br><em>each shelf.</em>", "ind.lede":"Specific manufacturing processes, tuned for the unique pain points of each sector.",
      "ind.1.name":"Food & beverage", "ind.1.body":"Dairy, frozen, confectionery. E & F flute litho lamination for moisture resistance; hot foil for premium confectionery branding.", "ind.1.a":"Dairy", "ind.1.b":"Frozen", "ind.1.c":"Chocolate · biscuits",
      "ind.2.name":"Pharmaceuticals & healthcare", "ind.2.body":"Precision-engineered packaging prioritising structural integrity and clinical reliability, with guillotine cutting for exact dosage requirements.", "ind.2.a":"Dosage precision", "ind.2.b":"Structural integrity",
      "ind.3.name":"Household & hygiene", "ind.3.body":"High-capacity production of durable, high-visibility packaging via window patching, designed for the rigours of the retail and detergent supply chain.", "ind.3.a":"Detergents", "ind.3.b":"Tissue · hygiene",
      "story.eyebrow":"04 / Our story", "story.title":"From pioneer<br><em>to leader.</em>",
      "story.p1":"Founded in 1973 by the late Mr. Mohammed Mustafa Abed, Nasrpac began as one of the Kingdom's carton-converting pioneers — serving the growing demand for packaging across Saudi Arabia and the GCC.",
      "story.p2":"Today, family-driven leadership continues the founder's vision. Engr. Taleb Abed (Management) drives strategic vision and operational modernisation; Mr. Ahmed Abed (Finance) stewards long-term investment capacity.",
      "story.p3":"Five decades of experience in the carton family business. Continuous investment in technology has built a trusted name in the printing and converting industry.",
      "val.1":"Integrity", "val.2":"Quality excellence", "val.3":"Customer partnership", "val.4":"Innovation", "val.5":"Continuous improvement", "val.6":"Sustainability",
      "q.eyebrow":"05 / Quality & sustainability", "q.title":"Measured,<br><em>then repeated.</em>", "q.lede":"Strict control procedures through an on-site laboratory, and environmentally responsible recycling across the production cycle.",
      "q.lab":"On-site laboratory", "q.lab.body":"Modern test equipment and machineries. Every batch checked against the stringent requirements of our multinational partners.", "q.tbd":"[TBD]", "q.tbd2":"[TBD]", "q.tbd3":"[TBD]",
      "q.water":"Waste-water recycling", "q.water.body":"Industrial water treatment systems minimise environmental impact from the production cycle.",
      "q.solid":"Solid waste management", "q.solid.body":"A comprehensive recycling programme diverts manufacturing by-products back into the circular economy.",
      "cl.eyebrow":"06 / Partners", "cl.title":"Trusted by<br><em>leading brands.</em>", "cl.lede":"Local, regional and multinational brands rely on Nasrpac for packaging that performs on the shelf and on the filling line.",
      "quote.eyebrow":"07 / Partnership hub", "quote.title":"Let's make something<br><em>worth holding.</em>", "quote.lede":"Share the essentials — style, quantity, deadline — and our technical team responds with pricing and lead time.",
      "quote.tel":"Telephone", "quote.email":"Email", "quote.addr":"Facility", "quote.addr.value":"Ibn Moammar St, Al Wadi Dist., Jeddah 22518",
      "f.name":"Full name", "f.company":"Company", "f.email":"Email", "f.phone":"Phone", "f.product":"Product type", "f.choose":"Choose…",
      "f.p1":"Folding carton", "f.p2":"Offset printing", "f.p3":"Litho lamination", "f.p4":"Die cutting", "f.p5":"Other",
      "f.qty":"Quantity", "f.message":"Message", "f.file":"Artwork / dieline (optional, PDF or AI, max 10 MB)", "f.submit":"Send request",
      "f.note":"Your files are handled confidentially and used only to prepare your quotation.",
      "err.name":"Please enter your name.", "err.company":"Please enter your company.", "err.email":"Please enter a valid email.", "err.phone":"Please enter a phone number.",
      "err.product":"Please choose a product type.", "err.qty":"Please enter a quantity of 1 or more.", "err.file":"File must be PDF or AI and under 10 MB.",
      "form.sending":"Sending…", "form.ok":"Thank you — your request has been recorded. Our team will respond shortly.", "form.fail":"Something went wrong. Please try again or email us directly.", "form.noEndpoint":"Demo mode: [ENDPOINT] not configured. Your details were not sent.",
      "footer.desc":"Nasr Packaging & Printing Co. — five decades of carton and printing expertise, Al-Khumrah, Jeddah.",
      "footer.contact":"Contact", "footer.map":"Map placeholder", "footer.legal":"Company", "footer.credit":"Print precision · Al-Khumrah, Jeddah", "footer.top":"Back to top ↑", "footer.made1":"Made with", "footer.made2":"by Nasrpac Team",
      "step.1.title":"Sheeting", "step.1.desc":"Board is cut from the reel into press-size sheets.",
      "step.2.title":"Printing", "step.2.desc":"Four colour units lay down yellow, magenta, cyan and black in register.",
      "step.3.title":"Die-cutting", "step.3.desc":"A steel-rule die cuts the carton shape and scores every fold line.",
      "step.4.title":"Folding", "step.4.desc":"Panels fold along their creases into a square sleeve.",
      "step.5.title":"Gluing", "step.5.desc":"A bead of glue seals the side flap. The carton is square, closed and ready to fill."
    },
    ar: {
      "skip":"تخطَّ إلى المحتوى",
      "nav.process":"مراحل الإنتاج", "hs.all":"جميع القدرات",
      "tab.1":"الطباعة", "tab.2":"اللصق", "tab.3":"التحويل", "tab.4":"التشطيب", "tab.5":"الجودة",
      "hs.1.ph":"تصوير · صالة الطباعة — مطابع الأوفست", "hs.2.ph":"تصوير · خط اللصق الليثوغرافي", "hs.3.ph":"تصوير · القص بالقوالب والتحويل", "hs.4.ph":"تصوير · خط الطي واللصق", "hs.5.ph":"تصوير · مختبر الجودة",
      "hs.1.a":"طباعة أوفست بأربعة ألوان", "hs.1.b":"تشطيبات UV موضعية وملمس ناعم",
      "hs.2.a":"لصق ليثوغرافي بتموج E وF", "hs.2.b":"مقاومة الرطوبة للمنتجات المجمدة",
      "hs.3.a":"القص بالقوالب والكبس", "hs.3.b":"لصق النوافذ",
      "hs.4.a":"الطي واللصق — علبة جاهزة للتعبئة", "hs.4.b":"شريط الفتح والتمزيق",
      "hs.5.a":"مختبر داخل المصنع", "hs.5.b":"إعادة تدوير مياه الصرف",
      "tab.6":"التوريد", "hs.6.ph":"تصوير · ساحة الشحن", "hs.6.a":"التحميل من أرصفتنا", "hs.6.b":"التوريد إلى جميع دول الخليج",
      "nav.capabilities":"القدرات", "nav.industries":"القطاعات", "nav.story":"قصتنا", "nav.quality":"الجودة", "nav.quote":"عرض سعر",
      "cta.quote":"اطلب عرض سعر", "cta.capabilities":"استعرض القدرات",
      "hero.kicker":"شركة نصر للتعبئة والطباعة · جدة",
      "hero.t1":"خمسة عقود", "hero.t2":"من", "hero.t3":"الدقة.",
      "hero.lede":"علب كرتونية قابلة للطي، طباعة أوفست وكرتون محول — مصممة في الخمرة، جدة منذ ١٩٧٣ لشركاء الأغذية والأدوية والسلع الاستهلاكية في الخليج.",
      "hero.tag":"اسحب للتدوير",
      "mq.1":"طباعة أوفست", "mq.2":"الأشعة فوق البنفسجية والمؤثرات الخاصة", "mq.3":"الطباعة بالرقائق الساخنة", "mq.4":"اللصق الليثوغرافي", "mq.5":"القص بالقوالب", "mq.6":"لصق النوافذ", "mq.7":"الطي واللصق",
      "ph.facility":"صورة · أرضية الإنتاج، الخمرة", "ph.food":"صورة · علب الأغذية", "ph.pharma":"صورة · علب الأدوية", "ph.household":"صورة · عبوات منزلية", "ph.story":"صورة · أرشيف السبعينيات", "ph.lab":"صورة · مختبر الجودة",
      "story.y2":"+٥٠ عاماً", "story.y3":"اليوم", "val.label":"قيمنا", "f.head":"طلب عرض سعر",
      "hero.scroll":"مرِّر للاستكشاف",
      "line.kicker":"التصنيع في حركة",
      "line.t1":"من اللوح المسطح", "line.t2":"إلى", "line.t3":"علبة مكتملة.",
      "stat.founded":"التأسيس", "stat.facility":"المنشأة", "stat.capacity":"الطاقة", "stat.location":"الموقع",
      "intro.eyebrow":"٠١ / شريك من نوع مختلف",
      "intro.note":"التغليف الجيد يفعل أكثر من حماية المنتج. يجذب الانتباه، ويحمل وعداً، ويضبط كل تفصيلة.",
      "intro.title":"أول نقطة تواصل.<br>آخر تفصيلة.<br><em>كل جزء مهم.</em>",
      "intro.p1":"منذ ١٩٧٣ بنت نصر باك سمعة لحلول تغليف مبتكرة وعالية الجودة ومستدامة — موثوقة من علامات محلية وإقليمية وعالمية رائدة.",
      "intro.p2":"القيادة العائلية تواصل رؤية المؤسس. الحرفة والقدرة تعملان معاً: معرفة المواد، انتظام الإنتاج، والاهتمام بالتفاصيل.",
      "intro.link":"قصتنا",
      "cap.eyebrow":"٠٢ / ما نقدّمه",
      "cap.title":"عملية واحدة متصلة.<br><em>طرق متعددة للأمام.</em>",
      "cap.lede":"إحدى عشرة قدرة تصنيعية تحت سقف واحد. تفكير متكامل عبر الطباعة والتغليف والتحويل والتشطيب.",
      "pillar.1.name":"أوفست وأشعة ورقائق.", "pillar.1.a":"طباعة الأوفست", "pillar.1.b":"الأشعة فوق البنفسجية والمؤثرات الخاصة", "pillar.1.c":"الطباعة بالرقائق الساخنة",
      "pillar.1.body":"صور عالية الدقة وثبات لوني يُتحقق منه مقابل بروفة معتمدة. تغليف موضعي وكامل ومحكم وملمس ناعم.",
      "pillar.2.name":"كرتون إنشائي.", "pillar.2.a":"تغليف ليثوغرافي E وF", "pillar.2.b":"تغليف مموج أحادي",
      "pillar.2.body":"مصمم لسلامة إنشائية وحماية قصوى للمنتجات الثقيلة، مع مقاومة رطوبة للمجمدات.",
      "pillar.3.name":"تشكيل بدقة.", "pillar.3.a":"القص بالقوالب والكبس", "pillar.3.b":"القص بالمقصلة", "pillar.3.c":"تغليف النوافذ",
      "pillar.3.body":"تشكيل دقيق وعلامة ملموسة لتعزيز تجربة فتح العبوة. قص آلي لأبعاد دقيقة.",
      "pillar.4.name":"جاهز للخط.", "pillar.4.a":"الطي واللصق", "pillar.4.b":"شريط الفتح والتمزيق", "pillar.4.c":"عبوات الصدفة (Clamshell)",
      "pillar.4.body":"تجميع نهائي متقدم يضمن الكمال الإنشائي — مربع، جاهز لخطوط التعبئة الآلية.",
      "ind.eyebrow":"٠٣ / حلول القطاعات", "ind.title":"مهندسة<br><em>لكل رف.</em>", "ind.lede":"عمليات تصنيع محددة، مصمَّمة لتلبية التحديات الخاصة بكل قطاع.",
      "ind.1.name":"الأغذية والمشروبات", "ind.1.body":"ألبان ومجمدات وحلويات. تغليف ليثوغرافي بطبقتَي E وF لمقاومة الرطوبة؛ رقائق ساخنة لعلامة الحلويات الفاخرة.", "ind.1.a":"ألبان", "ind.1.b":"مجمدات", "ind.1.c":"شوكولاتة · بسكويت",
      "ind.2.name":"الأدوية والرعاية الصحية", "ind.2.body":"تغليف مهندس بدقة يعطي الأولوية للسلامة الإنشائية والموثوقية السريرية، مع قص مقصي لمتطلبات جرعات دقيقة.", "ind.2.a":"دقة الجرعات", "ind.2.b":"سلامة إنشائية",
      "ind.3.name":"المنزل والمنظفات والنظافة", "ind.3.body":"إنتاج عالي السعة لتغليف متين وعالي الظهور عبر تغليف النوافذ، مصمم لقسوة سلسلة التجزئة والمنظفات.", "ind.3.a":"منظفات", "ind.3.b":"مناديل · نظافة",
      "story.eyebrow":"٠٤ / قصتنا", "story.title":"من الرائد<br><em>إلى القائد.</em>",
      "story.p1":"تأسست نصر باك عام ١٩٧٣ على يد المرحوم السيد محمد مصطفى عابد، وبدأت كإحدى رواد تحويل الكرتون في المملكة.",
      "story.p2":"اليوم، تواصل القيادة العائلية رؤية المؤسس. يقود المهندس طالب عابد (الإدارة) الرؤية الاستراتيجية؛ ويشرف السيد أحمد عابد (المالية) على القدرة الاستثمارية.",
      "story.p3":"خمسة عقود من الخبرة في الأعمال الكرتونية العائلية. الاستثمار المستمر في التقنية بنى اسماً موثوقاً.",
      "val.1":"النزاهة", "val.2":"تميز الجودة", "val.3":"شراكة العملاء", "val.4":"الابتكار", "val.5":"التحسين المستمر", "val.6":"الاستدامة",
      "q.eyebrow":"٠٥ / الجودة والاستدامة", "q.title":"نقيسها،<br><em>ثم نكرّرها.</em>", "q.lede":"إجراءات رقابة صارمة عبر مختبر داخل المصنع، وإعادة تدوير مسؤولة بيئياً عبر دورة الإنتاج.",
      "q.lab":"مختبر داخل المصنع", "q.lab.body":"معدات وآلات اختبار حديثة. كل تشغيلة تُفحص مقابل المتطلبات الصارمة لشركائنا.", "q.tbd":"[TBD]", "q.tbd2":"[TBD]", "q.tbd3":"[TBD]",
      "q.water":"إعادة تدوير مياه الصرف", "q.water.body":"أنظمة معالجة مياه صناعية تقلل الأثر البيئي.",
      "q.solid":"إدارة النفايات الصلبة", "q.solid.body":"برنامج إعادة تدوير شامل يعيد المنتجات الثانوية للتصنيع إلى الاقتصاد الدائري.",
      "cl.eyebrow":"٠٦ / الشركاء", "cl.title":"موثوقون<br><em>من علامات رائدة.</em>", "cl.lede":"تعتمد علامات محلية وإقليمية وعالمية على نصر باك في عبوات تُقنع على الرف وتعمل بكفاءة على خطوط التعبئة.",
      "quote.eyebrow":"٠٧ / مركز الشراكة", "quote.title":"لنصنع معاً شيئاً<br><em>يستحق الإمساك.</em>", "quote.lede":"شاركونا الأساسيات — النمط والكمية والموعد — وسيرد فريقنا بالتسعير ومدة التنفيذ.",
      "quote.tel":"الهاتف", "quote.email":"البريد", "quote.addr":"المنشأة", "quote.addr.value":"شارع ابن معمر، حي الوادي، جدة ٢٢٥١٨",
      "f.name":"الاسم الكامل", "f.company":"الشركة", "f.email":"البريد الإلكتروني", "f.phone":"الهاتف", "f.product":"نوع المنتج", "f.choose":"اختر…",
      "f.p1":"علبة كرتونية قابلة للطي", "f.p2":"طباعة أوفست", "f.p3":"تغليف ليثوغرافي", "f.p4":"قص بالقوالب", "f.p5":"أخرى",
      "f.qty":"الكمية", "f.message":"الرسالة", "f.file":"ملف التصميم / القالب (اختياري، PDF أو AI، حتى ١٠ م.ب)", "f.submit":"إرسال الطلب",
      "f.note":"تُعامَل ملفاتك بسرية تامة وتُستخدم فقط لإعداد عرض السعر.",
      "err.name":"يرجى إدخال الاسم.", "err.company":"يرجى إدخال اسم الشركة.", "err.email":"يرجى إدخال بريد إلكتروني صالح.", "err.phone":"يرجى إدخال رقم هاتف.",
      "err.product":"يرجى اختيار نوع المنتج.", "err.qty":"يرجى إدخال كمية ١ أو أكثر.", "err.file":"يجب أن يكون الملف PDF أو AI وبحجم أقل من ١٠ م.ب.",
      "form.sending":"جارٍ الإرسال…", "form.ok":"شكراً لك — تم تسجيل طلبك. سيرد فريقنا قريباً.", "form.fail":"حدث خطأ. حاول مجدداً أو راسلنا مباشرة.", "form.noEndpoint":"وضع تجريبي: [ENDPOINT] غير مهيأ. لم تُرسل بياناتك.",
      "footer.desc":"شركة نصر للتعبئة والطباعة — خمسة عقود من خبرة الكرتون والطباعة، الخمرة، جدة.",
      "footer.contact":"التواصل", "footer.map":"خريطة (مؤقت)", "footer.legal":"الشركة", "footer.credit":"دقة الطباعة · الخمرة، جدة", "footer.top":"إلى الأعلى ↑", "footer.made1":"صُنع بكل", "footer.made2":"من فريق نصر باك",
      "step.1.title":"التقطيع", "step.1.desc":"يُقطع الكرتون من البكرة إلى ألواح بحجم المطبعة.",
      "step.2.title":"الطباعة", "step.2.desc":"أربع وحدات ألوان تضع الأصفر والأرجواني والسماوي والأسود في التسجيل.",
      "step.3.title":"القص بالقوالب", "step.3.desc":"قالب فولاذي يقطع شكل العلبة ويضع علامات على كل خط طي.",
      "step.4.title":"الطي", "step.4.desc":"تُطوى الألواح على طول خطوطها لتشكيل هيكل مربع.",
      "step.5.title":"اللصق", "step.5.desc":"قطرة صمغ تغلق اللسان الجانبي. العلبة مربعة وجاهزة للتعبئة."
    }
  };

  let currentLang = "en";
  function applyLang(lang){
    currentLang = (lang === "ar") ? "ar" : "en";
    const dict = I18N[currentLang];
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const val = dict[key];
      if (val == null) return;
      if (val.includes("<br>") || val.includes("<em>")) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-lang-label]").forEach(el=>{
      el.textContent = currentLang === "ar" ? "EN" : "AR";
    });
    updateStepCaption(currentStepIndex);
  }

  // --- 3D World Variables ---
  const W = 520, H = 290, D = [120, 70, 120, 70, 24], X = [59, 179, 249, 369, 439];
  let world, L, HD, blade, web, sheet, platen, dl, cr, cut;
  let currentStepIndex = -1;
  let stepsList, cn, cd;

  function initLang(){
    let stored = null;
    try { stored = localStorage.getItem("nasrpac-lang"); } catch(_){}
    applyLang(stored || "en");
    document.querySelectorAll("[data-lang-toggle]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const next = currentLang === "en" ? "ar" : "en";
        applyLang(next);
        try { localStorage.setItem("nasrpac-lang", next); } catch(_){}
      });
    });
  }

  function initNav(){
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    function onScroll(){ nav.classList.toggle("is-scrolled", window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toggle && links){
      const setOpen = (open)=>{
        links.classList.toggle("is-open", open);
        nav.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      };
      toggle.addEventListener("click", ()=> setOpen(!links.classList.contains("is-open")));
      links.querySelectorAll("a").forEach(a=> a.addEventListener("click", ()=> setOpen(false)));
      document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") setOpen(false); });
    }
  }

  // --- Stats counter ---
  function initCounters(){
    const els = document.querySelectorAll(".count[data-count]");
    const fmt = (el, v)=> el.hasAttribute("data-nogroup") ? String(v) : v.toLocaleString("en-US");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const run = (el)=>{
      const target = +el.dataset.count;
      const from = el.hasAttribute("data-nogroup") ? Math.max(0, target - 60) : 0;
      const t0 = performance.now(), dur = 1400;
      const step = (now)=>{
        const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(el, Math.round(from + (target - from) * e));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if (en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
    }, { threshold: .6 });
    els.forEach(el=> io.observe(el));
  }

  function initReveal(){
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)){
      els.forEach(el=>el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el=>io.observe(el));
  }

  // --- SECTION 1: Hero scene slider (scroll-driven) ---
  function initHeroSlider(){
    const hero = document.querySelector(".hs");
    if (!hero) return;
    requestAnimationFrame(()=> hero.classList.add("is-ready"));
    const slides = [...hero.querySelectorAll(".hs__slide")];
    const tabs = [...hero.querySelectorAll(".hs__tab")];
    const bars = [...hero.querySelectorAll(".hs__progress i")];
    const N = slides.length;
    let smoothP = null;
    hero.addEventListener("hs:smooth", (e)=>{ smoothP = e.detail; req(); });
    let cur = -1, raf = 0;

    // Scroll distance available inside the pinned section, and progress 0..1
    const range = ()=> Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = ()=> Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / range()));

    function show(i){
      if (i === cur) return;
      cur = i;
      slides.forEach((sl, k)=> sl.classList.toggle("is-active", k === i));
      tabs.forEach((t, k)=>{ t.classList.toggle("is-active", k === i); t.setAttribute("aria-selected", String(k === i)); });
      hero.querySelectorAll(".hotspot.is-open").forEach(h=> h.classList.remove("is-open"));
      hero.classList.toggle("is-last", i === N - 1);
    }
    function update(){
      raf = 0;
      const p = smoothP != null ? smoothP : progress() * N;   // 0..N (3D layer sends a smoothed value)
      const i = Math.min(N - 1, Math.floor(p));
      show(i);
      bars.forEach((b, k)=> b.style.setProperty("--p", Math.min(1, Math.max(0, p - k))));
    }
    const req = ()=>{ if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);

    // Tabs jump to the middle of their scroll segment
    function scrollToSlide(k){
      const top = hero.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + range() * (k + 0.5) / N, behavior: reduceMotion ? "auto" : "smooth" });
    }
    tabs.forEach((t, k)=> t.addEventListener("click", ()=> scrollToSlide(k)));
    hero.addEventListener("keydown", (e)=>{
      if (!e.target.classList.contains("hs__tab")) return;
      const rtl = document.documentElement.dir === "rtl";
      const fwd = rtl ? "ArrowLeft" : "ArrowRight", back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key !== fwd && e.key !== back) return;
      e.preventDefault();
      const k = Math.min(N - 1, Math.max(0, cur + (e.key === fwd ? 1 : -1)));
      scrollToSlide(k); tabs[k].focus();
    });
    hero.querySelectorAll(".hotspot").forEach(h=> h.addEventListener("click", ()=>{
      const open = !h.classList.contains("is-open");
      hero.querySelectorAll(".hotspot.is-open").forEach(x=> x.classList.remove("is-open"));
      h.classList.toggle("is-open", open);
    }));
    update();
  }

  // --- SECTION 2: Production Line ---
  function initWorld() {
    world = document.getElementById('world');
    if (!world) return;

    const art = i => `<div class="art${i%2 ? ' side' : ' wide'}">${i==4 ? '<s class="gl"></s>' : ['y','m','c','k'].map((k,j)=>`<i class="ly ${k}" data-p="${i}" data-k="${j}">${k=='k'?(i%2?'<u></u>':'<img src="logo.png" alt="" draggable="false">'):''}</i>`).join('')}</div>`;
    const fl = i => (i==0 || i==2) ? '<div class="fl ft"></div><div class="fl fb"></div>' : '';
    let h = '';
    for (let i=4; i>=0; i--) h = `<div class="pn p${i}" style="width:${D[i]}px">${art(i)}${fl(i)}${h}</div>`;
    
    const heads = ['var(--yellow)', 'var(--magenta)', 'var(--cyan)', 'var(--ink)'].map(c => `<div class="hd" style="background:${c};color:${c}"></div>`).join('');
    
    world.innerHTML = `
      <div class="sheet"></div>
      <div class="web"></div>
      <div class="blade"></div>
      ${h}
      <svg class="cut" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <path id="cr" d="M179,68V218M249,68V218M369,68V218M439,68V218M59,68H179M59,218H179M249,68H369M249,218H369" stroke="var(--cyan)" stroke-width="1.5" stroke-dasharray="4 4"/>
        <path id="dl" pathLength="1" d="M59,68V32H179V68H249V32H369V68H439L463,76V210L439,218H369V254H249V218H179V254H59V218Z" stroke="var(--magenta)" stroke-width="2.5" stroke-dasharray="1" stroke-dashoffset="1"/>
      </svg>
      <div class="platen"></div>
      ${heads}
    `;

    L = [...world.querySelectorAll('.ly')];
    HD = [...world.querySelectorAll('.hd')];
    blade = world.querySelector('.blade');
    web = world.querySelector('.web');
    sheet = world.querySelector('.sheet');
    platen = world.querySelector('.platen');
    dl = world.querySelector('#dl');
    cr = world.querySelector('#cr');
    cut = world.querySelector('.cut');

    stepsList = document.getElementById('steps');
    cn = document.getElementById('cn');
    cd = document.getElementById('cd');

    const STEPS_LEN = 5;
    stepsList.innerHTML = Array.from({length: STEPS_LEN}).map((_, i) => `<li><i><b></b></i><span data-step-title="${i}"></span></li>`).join('');
    updateStepCaption(0);
  }

  function updateStepCaption(idx) {
    if (!stepsList) return;
    const dict = I18N[currentLang];
    const li = [...stepsList.children];
    if (idx !== currentStepIndex) {
      currentStepIndex = idx;
      cn.textContent = dict[`step.${idx+1}.title`];
      cd.textContent = dict[`step.${idx+1}.desc`];
      const ci = document.getElementById('ci');
      if (ci) ci.textContent = `0${idx+1} / 05`;
      li.forEach((e, i) => {
        e.classList.toggle('on', i <= idx);
        const span = e.querySelector('[data-step-title]');
        if (span) span.textContent = dict[`step.${i+1}.title`];
      });
    }
  }

  const $ = s => document.querySelector(s), cl = (v, a=0, b=1) => Math.min(b, Math.max(a, v)), rg = (p, a, b) => cl((p-a)/(b-a)), lp = (a, b, t) => a + (b-a)*t, ez = t => t < .5 ? 2*t*t : 1 - (-2*t+2)**2/2;

  let S = 1;
  const sb = document.getElementById('hero-stage-line');
  const fit = () => { const b = sb.getBoundingClientRect(); S = Math.min(b.width/(W*1.08), b.height/(H*(innerWidth < 960 ? 2 : 1.5)), 2.2); };

  function draw(p){
    if (!world) return;
    const s1=rg(p,0,.17), s2=rg(p,.17,.4), s3=rg(p,.4,.6), s4=rg(p,.6,.8), s5=rg(p,.8,1);
    const f=ez(s4), gl=rg(s5,0,.2), g=ez(rg(s5,.2,.45)), c2=ez(rg(s5,.45,.65)), sp=ez(rg(s5,.65,1));
    const st=world.style;
    st.setProperty('--f', f); st.setProperty('--g', g); st.setProperty('--gl', gl); st.setProperty('--c2', c2);

    // 1 sheeting
    const wb=ez(rg(s1,.5,1));
    blade.style.transform=`scaleY(${rg(s1,.15,.5)})`; blade.style.opacity=1-rg(s1,.8,1);
    web.style.transform=`translate3d(${wb*220}px,0,-1px)`; web.style.opacity=1-wb;

    // 2 printing
    const bx=lp(30,575,ez(s2));
    L.forEach(e=>{const i=+e.dataset.p,k=+e.dataset.k,t=cl((bx-k*36-X[i])/D[i]); e.style.setProperty('--cl',(1-t)*100+'%')});
    HD.forEach((e,k)=>{e.style.left=bx-k*36+'px'; e.style.opacity=s2>0&&s2<1?1:0});

    // 3 die-cutting
    const dn=ez(rg(s3,0,.25)), up=ez(rg(s3,.5,.75)), sc=ez(rg(s3,.6,1));
    platen.style.transform=`translate3d(0,${-(H+90)*((1-dn)+up)}px,6px)`;
    platen.style.opacity = (s3 > 0 && s3 < 1) ? 1 : 0;
    dl.style.strokeDashoffset=1-rg(s3,.25,.6); cr.style.opacity=ez(rg(s3,.5,.8));
    cut.style.opacity=1-rg(s4,0,.12);
    sheet.style.transform=`translate3d(0,${sc*170}px,-1px) rotate(${sc*7}deg)`; sheet.style.opacity=1-sc;

    // 4-5 camera
    const px=lp(260,119,f), pz=lp(0,-35,f), ry=lp(lp(-6,42,f),335,sp), ex=lp(-70,0,ez(rg(p,0,.08)));
    world.style.transform=`translate3d(260px,145px,0) scale(${S}) translate3d(${ex}px,0,0) rotateX(-14deg) rotateY(${ry}deg) translate3d(${-px}px,-145px,${-pz}px)`;

    // captions
    const idx = p < .17 ? 0 : p < .4 ? 1 : p < .6 ? 2 : p < .8 ? 3 : 4;
    updateStepCaption(idx);
    [s1,s2,s3,s4,s5].forEach((v,i) => {
      const b = stepsList.children[i].querySelector('b');
      if (b) b.style.width = v*100 + '%';
    });
  }

  function initScrollScene() {
    const track = document.getElementById('line');
    if (!track) return;
    let raf = 0;
    const tick = () => { raf = 0; const r = track.getBoundingClientRect(); draw(cl(-r.top/(r.height-innerHeight))); };
    const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
    fit();
    if (reduceMotion) { draw(.995); }
    else {
      window.addEventListener('scroll', req, { passive: true });
      tick();
    }
    window.addEventListener('resize', () => { fit(); req(); if (reduceMotion) draw(.995); });
  }

  // Form Logic
  const ENDPOINT = "[ENDPOINT]";
  function setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (msg) { el.textContent = msg; el.hidden = false; }
    else { el.textContent = ""; el.hidden = true; }
  }

  function validateField(field) {
    const dict = I18N[currentLang];
    const { id, value, type, required } = field;
    let err = null;
    if (required && (!value || !String(value).trim())) {
      if (id === "f-name") err = dict["err.name"];
      else if (id === "f-company") err = dict["err.company"];
      else if (id === "f-email") err = dict["err.email"];
      else if (id === "f-phone") err = dict["err.phone"];
      else if (id === "f-product") err = dict["err.product"];
      else if (id === "f-qty") err = dict["err.qty"];
    } else if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      err = dict["err.email"];
    } else if (id === "f-qty" && value && (Number(value) < 1 || isNaN(Number(value)))) {
      err = dict["err.qty"];
    }
    if (id === "f-file") {
      const file = field.files && field.files[0];
      if (file) {
        const okType = /\.(pdf|ai|eps)$/i.test(file.name);
        const okSize = file.size <= 10 * 1024 * 1024;
        if (!okType || !okSize) err = dict["err.file"];
      }
    }
    return err;
  }

  function initForm() {
    const form = document.getElementById("quote-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const fields = form.querySelectorAll("input, select, textarea");
    const errIdFor = (id) => "err-" + id.replace(/^f-/, "");

    fields.forEach(field => {
      field.addEventListener("blur", () => {
        const err = validateField(field);
        field.setAttribute("aria-invalid", err ? "true" : "false");
        if (err) field.setAttribute("aria-describedby", errIdFor(field.id));
        else field.removeAttribute("aria-describedby");
        setError(errIdFor(field.id), err);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dict = I18N[currentLang];
      let firstInvalid = null;
      fields.forEach(field => {
        const err = validateField(field);
        field.setAttribute("aria-invalid", err ? "true" : "false");
        if (err) {
          setError(errIdFor(field.id), err);
          field.setAttribute("aria-describedby", errIdFor(field.id));
          if (!firstInvalid) firstInvalid = field;
        } else {
          setError(errIdFor(field.id), null);
          field.removeAttribute("aria-describedby");
        }
      });
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) { status.className = "form__status is-err"; status.textContent = ""; }
        return;
      }
      if (status) { status.className = "form__status"; status.textContent = dict["form.sending"]; }

      const fd = new FormData(form);
      // Honeypot: bots fill hidden fields; silently pretend success
      if (fd.get("website")) { if (status) { status.className = "form__status is-ok"; status.textContent = dict["form.ok"]; } return; }
      fd.delete("website");
      if (!ENDPOINT || ENDPOINT === "[ENDPOINT]") {
        setTimeout(() => {
          if (status) { status.className = "form__status is-ok"; status.textContent = dict["form.noEndpoint"]; }
        }, 400);
        return;
      }
      try {
        const res = await fetch(ENDPOINT, { method: "POST", body: fd });
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (status) { status.className = "form__status is-ok"; status.textContent = dict["form.ok"]; }
        form.reset();
      } catch (err) {
        if (status) { status.className = "form__status is-err"; status.textContent = dict["form.fail"]; }
      }
    });
  }

  function initYear(){
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function boot(){
    initLang();
    initNav();
    initReveal();
    initCounters();
    initHeroSlider();
    initWorld();
    initScrollScene();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();