import { UserRole, UserStatus, NewsItem, RuleCategory, JobItem, ProductItem, FAQItem, SiteSettings } from '../../src/types';

export const initialSiteSettings: SiteSettings = {
  siteName: 'PRIME RP',
  siteDescription: 'المنصة الرسمية وسيرفر اللعب الواقعي الفاخر Prime RP FiveM',
  discordUrl: 'https://discord.gg/primerp',
  fiveMConnectUrl: '',
  contactEmail: 'support@prime-rp.com',
  maintenanceMode: false,
  activePlayersCount: 0,
  maxPlayersCount: 0,
  serverStatus: 'OFFLINE',
  logos: {
    main: '/assets/prime-logo.png',
    navbar: '/assets/prime-logo.png',
    hero: '/assets/prime-logo.png',
    footer: '/assets/prime-logo.png',
    login: '/assets/prime-logo.png',
    favicon: '/assets/prime-logo.png'
  }
};

export const initialUsers: any[] = [];

export const initialNews: NewsItem[] = [
  {
    id: 'news_01',
    slug: 'prime-rp-v3-overhaul',
    status: 'PUBLISHED',
    featured: true,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop&q=80',
    category: 'تحديثات السيرفر',
    authorId: 'usr_superadmin',
    authorName: 'Prime Owner',
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date().toISOString(),
    translations: {
      ar: {
        title: 'إطلاق التحديث الجذري 3.0 لسيرفر Prime RP وتحديث النظام المالي',
        excerpt: 'يسر إدارة Prime RP الإعلان عن إطلاق أضخم تحديث في تاريخ السيرفر مع نظام اقتصاد وتجارة جديد كلياً.',
        content: `نرحب بجميع مواطني مجتمع Prime RP في التحديث التاريخي 3.0.

أبرز ما يتضمنه التحديث:
1. إعادة ضبط شاملة لمؤشرات التضخم وسوق السيارات الفاخرة.
2. إضافة أكثر من 30 مركبة واقعية حصرية معدلة فيزيائياً.
3. توسيع أحياء المدينة وإتاحة عقارات وفلل سكنية جديدة بنظام تمليك دقيق.
4. تحسينات جذرية على خوادم الاستضافة لتقليل وقت الاستجابة بنسبة 40%.`,
        seoTitle: 'تحديث Prime RP 3.0 الشامل للنظام المالي والمدينة',
        seoDescription: 'تفاصيل التحديث الأكبر لسيرفر Prime RP العربي'
      },
      en: {
        title: 'Prime RP 3.0 Massive City Overhaul & Economic System Release',
        excerpt: 'Prime RP Administration proudly presents the largest city update in server history featuring a refined economic landscape.',
        content: `Welcome citizens to the grand release of Prime RP 3.0.

Key highlights:
1. Complete recalibration of financial metrics and luxury automotive trade.
2. Influx of 30+ custom physics-tuned luxury vehicles.
3. Expanded metropolitan zoning with custom residential deeds.
4. Infrastructure latency improvements yielding 40% faster responsiveness.`,
        seoTitle: 'Prime RP 3.0 Major Update Announcement',
        seoDescription: 'Official release notes for Prime RP 3.0 city overhaul'
      }
    }
  },
  {
    id: 'news_02',
    slug: 'police-academy-intake-2026',
    status: 'PUBLISHED',
    featured: false,
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=80',
    category: 'القطاع الحكومي',
    authorId: 'usr_admin',
    authorName: 'Faris Al-Harbi',
    createdAt: new Date('2026-03-10').toISOString(),
    updatedAt: new Date().toISOString(),
    translations: {
      ar: {
        title: 'فتح باب القبول والتسجيل في أكاديمية شرطة Prime RP لدفعة الضباط الجديدة',
        excerpt: 'أعلنت قيادة شرطة المدينة عن بدء استقبال طلبات الالتحاق بصفوف القوة الأمنية.',
        content: 'تعلن القيادة العامة لشرطة Prime RP عن بدء التسجيل للدورة التأهيلية 14. تتضمن الدورة تدريبات ميدانية على المطاردات والتحقيقات الجنائية والتكتيكات الخاصة.',
        seoTitle: 'فتح تسجيل أكاديمية الشرطة Prime RP',
        seoDescription: 'شروط التسجيل في قطاع الشرطة بسيرفر Prime RP'
      },
      en: {
        title: 'Police Academy Cadet Intake Now Open for Prime RP Constabulary',
        excerpt: 'The Metropolitan Police Department announces enrollment for the incoming cadet class.',
        content: 'The High Command of Prime RP Police Department opens registrations for Academy Class 14, including tactical pursuit handling and forensic investigation training.',
        seoTitle: 'Police Academy Intake Prime RP',
        seoDescription: 'Cadet requirements and enrollment for Prime RP police'
      }
    }
  },
  {
    id: 'news_03',
    slug: 'vip-black-card-launch',
    status: 'PUBLISHED',
    featured: false,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    category: 'المتجر والامتيازات',
    authorId: 'usr_superadmin',
    authorName: 'Prime Owner',
    createdAt: new Date('2026-03-14').toISOString(),
    updatedAt: new Date().toISOString(),
    translations: {
      ar: {
        title: 'تدشين بطاقة Prime VIP Black Card الحصرية مع أولوية الدخول القصوى',
        excerpt: 'أصبح بإمكان الداعمين الآن الحصول على أقصى درجات الفخامة والمميزات الحصرية في متجر السيرفر.',
        content: 'تمنح بطاقة Prime Black Card حاملها أولوية قصوى لتخطي قائمة الانتظار Queue Priority، بالإضافة إلى لوحة أرقام مميزة، وكراج خاص في أرقى أبراج المدينة.',
        seoTitle: 'بطاقة Prime VIP Black Card الفاخرة',
        seoDescription: 'مميزات رتبة VIP Black Card الحصرية'
      },
      en: {
        title: 'Prime VIP Black Card Launch Featuring Tier 1 Queue Priority',
        excerpt: 'Supporters can now acquire the pinnacle of prestige with dedicated garage access and queue privileges.',
        content: 'The Black Card package bestows top-tier bypass queue priority, personalized license plates, and dedicated penthouse garage access.',
        seoTitle: 'Prime VIP Black Card Launch',
        seoDescription: 'Exclusive perks and tier 1 queue priority for Prime RP'
      }
    }
  }
];

export const initialRules: RuleCategory[] = [
  {
    id: 'rule_general',
    slug: 'general-rules',
    order: 1,
    translations: {
      ar: {
        title: 'القوانين العامة ومبادئ السيرفر',
        description: 'القواعد الأساسية التي تضمن بيئة لعب محترمة ونزيهة لجميع أعضاء المجتمع.',
        penaltyInfo: 'تبدأ العقوبات من الإنذار الشفهي وتصل إلى الحظر الدائم في حال التكرار أو الإساءة الجسيمة.'
      },
      en: {
        title: 'General Server Principles',
        description: 'Fundamental ground rules ensuring a respectful, professional gaming environment.',
        penaltyInfo: 'Penalties range from formal warnings up to permanent administrative bans for severe violations.'
      }
    },
    rules: [
      {
        id: 'r_g1',
        number: '1.1',
        translations: {
          ar: {
            title: 'الاحترام المتبادل وعدم الإساءة (Toxicity / Harassment)',
            description: 'يُمنع منعاً باتاً أي شكل من أشكال السب والشتم، العنصرية، الإهانات الدينية أو الشخصية سواء داخل المدينة أو في الديسكورد.',
            warning: 'عقوبة فورية بالحظر بدون تردد.'
          },
          en: {
            title: 'Mutual Respect & Anti-Harassment',
            description: 'Hate speech, personal defamation, religious slurs, and toxic behavior are strictly forbidden across all platforms.',
            warning: 'Zero-tolerance instant ban.'
          }
        }
      },
      {
        id: 'r_g2',
        number: '1.2',
        translations: {
          ar: {
            title: 'منع استغلال الثغرات والبرامج الممنوعة (Cheating / Exploiting)',
            description: 'استخدام برامج مساعدة غير مصرح بها، استغلال ثغرات Duping للأموال أو العناصر، يعرض الحساب للشطب النهائي.',
            warning: 'حظر دائم مع تصفير كامل للممتلكات.'
          },
          en: {
            title: 'Anti-Exploitation & Third-Party Software',
            description: 'Any injection software, item duplication glitches, or physics exploits result in permanent account termination.',
            warning: 'Permanent ban and total asset wipe.'
          }
        }
      }
    ]
  },
  {
    id: 'rule_roleplay',
    slug: 'roleplay-fundamentals',
    order: 2,
    translations: {
      ar: {
        title: 'قواعد الرول بلاي والواقعية (RP Fundamentals)',
        description: 'المعايير المحددة التي تبني قصص واقعية وتمنع كسر الشخصية.',
        penaltyInfo: 'إنذار إداري مع إيقاف مؤقت وسحب أسلحة أو مركبات في حال التجاوز.'
      },
      en: {
        title: 'Roleplay Standards & Immersion',
        description: 'Core standards maintaining cinematic immersion and narrative integrity.',
        penaltyInfo: 'Administrative strikes and temporary suspension upon repeated infractions.'
      }
    },
    rules: [
      {
        id: 'r_rp1',
        number: '2.1',
        translations: {
          ar: {
            title: 'تقدير الحياة (Value Your Life - NVL)',
            description: 'يجب على شخصيتك التصرف بخوف واقعي وتقدير لحياتها عند تهديدها بسلاح موجه ومباشر من قبل شخص آخر.',
            warning: 'عدم الامتثال عند رفع السلاح يُعد مخالفة جسيمة لقاعدة NVL.'
          },
          en: {
            title: 'Valuing Human Life (NVL)',
            description: 'Characters must display realistic preservation of life when faced with immediate lethal threat.',
            warning: 'Refusal to comply under direct firearm aim is considered severe NVL.'
          }
        }
      },
      {
        id: 'r_rp2',
        number: '2.2',
        translations: {
          ar: {
            title: 'منع كسر الشخصية داخل اللعبة (FailRP / OOC)',
            description: 'البقاء داخل الشخصية إلزامي طوال وجودك داخل السيرفر. يُمنع التحدث بأمور خارج اللعبة عبر المايكروفون الصوتي.',
            warning: 'استخدم الشات المخصص أو تذاكر الدعم لمناقشة المشاكل الإدارية.'
          },
          en: {
            title: 'Immersion Integrity (FailRP / OOC)',
            description: 'Breaking character via local voice chat is forbidden. Keep out-of-character disputes confined to ticket channels.',
            warning: 'Always resolve disputes through support tickets rather than mid-scenario arguments.'
          }
        }
      },
      {
        id: 'r_rp3',
        number: '2.3',
        translations: {
          ar: {
            title: 'القتل العشوائي والتخريب (RDM / VDM)',
            description: 'يُمنع قتل أي لاعب دون سبب رول بلاي مسبق وسيناريو واضح، ويُمنع استخدام المركبات كسلاح لدهس اللاعبين.',
            warning: 'عقوبة سجن إداري أو حظر فوري.'
          },
          en: {
            title: 'Random Deathmatch & Vehicle Assault (RDM / VDM)',
            description: 'Assaulting or eliminating other citizens without antecedent narrative justification or using vehicles as kinetic weapons is strictly barred.',
            warning: 'Admin confinement or immediate server ban.'
          }
        }
      }
    ]
  },
  {
    id: 'rule_police',
    slug: 'police-rules',
    order: 3,
    translations: {
      ar: {
        title: 'قواعد قطاع الشرطة والعمليات الأمنية',
        description: 'اللوائح التنظيمية للتعامل مع المداهمات، نقاط التفتيش، وإطلاق النار.',
        penaltyInfo: 'إحالة إلى المحكمة العسكرية أو الفصل من الخدمة.'
      },
      en: {
        title: 'Law Enforcement Operational Codes',
        description: 'Standard operational procedures governing raids, traffic stops, and lethal escalation.',
        penaltyInfo: 'Internal disciplinary hearings or departmental dismissal.'
      }
    },
    rules: [
      {
        id: 'r_p1',
        number: '3.1',
        translations: {
          ar: {
            title: 'تدرج القوة الأمنية (Continuum of Force)',
            description: 'لا يجوز للضابط استخدام السلاح الناري المميت إلا في حال وجود خطر مباشر على حياة الأبرياء أو رجال الأمن.',
            warning: 'استخدام السلاح غير المبرر يؤدي لعقوبات صارمة.'
          },
          en: {
            title: 'Use of Force Escalation Matrix',
            description: 'Deadly kinetic force is restricted strictly to imminent threats to human life.',
            warning: 'Unjustified weapons deployment carries severe penalties.'
          }
        }
      }
    ]
  }
];

export const initialJobs: JobItem[] = [
  {
    id: 'job_police',
    slug: 'police-department',
    category: 'GOVERNMENT',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    salaryMin: 3500,
    salaryMax: 7800,
    status: 'HIRING_OPEN',
    translations: {
      ar: {
        name: 'شرطة المدينة (LSPD & Highway Patrol)',
        description: 'حماية أرواح وممتلكات المواطنين، مكافحة الجريمة المنظمة، وتنظيم الحركة المرورية داخل أحياء المدينة السريعة.',
        requirements: ['خبرة سابقة في أساليب الرول بلاي الواقعي', 'امتلاك مايكروفون واضح وانضباط صوتي عالي', 'الالتزام بقواعد تدرج استخدام القوة والتواصل اللاسلكي', 'اجتياز اختبارات الأكاديمية والمقابلة الصوتية'],
        duties: ['تسيير دوريات أمنية في قطاعات المدينة', 'مباشرة البلاغات وحوادث السطو المسلح', 'تأمين الفعاليات والمواكب الرسمية', 'كتابة تقارير الضبط وإحالة المتهمين للمحاكمة']
      },
      en: {
        name: 'Metropolitan Police Department',
        description: 'Safeguard civilian lives, suppress organized crime syndicates, and enforce transit safety across municipal corridors.',
        requirements: ['Demonstrated high-tier roleplay discipline', 'Clear microphone telemetry and professional demeanor', 'Strict compliance with departmental radio codes', 'Successful completion of Academy entrance exams'],
        duties: ['Active highway and district patrol duties', 'Responding to distress beacons and robbery alerts', 'Escort logistics and public event security', 'Filing arrest warrants and suspect booking']
      }
    }
  },
  {
    id: 'job_ems',
    slug: 'emergency-medical-services',
    category: 'EMERGENCY',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80',
    salaryMin: 3200,
    salaryMax: 6500,
    status: 'HIRING_OPEN',
    translations: {
      ar: {
        name: 'هيئة الهلال الطبي والإسعاف (EMS)',
        description: 'الاستجابة الفورية لحالات الطوارئ، إنعاش المصابين في مواقع الحوادث، وإدارة المستشفى المركزي في المدينة.',
        requirements: ['معرفة بمصطلحات الإسعافات الأولية والرول بلاي الطبي', 'سرعة الاستجابة وقيادة سيارات الإسعاف باحتراف', 'الحيادية التامة وعدم الانحياز لأي طرف في النزاعات'],
        duties: ['إنعاش ونقل المصابين من ساحات الحوادث', 'تقديم الرعاية الطبية وإجراء العمليات الجراحية بالرول بلاي', 'توفير الحقائب الطبية والعقاقير للمواطنين']
      },
      en: {
        name: 'Emergency Medical Services (EMS)',
        description: 'Provide paramedic triage, trauma stabilization at acute incident zones, and direct central hospital clinical care.',
        requirements: ['Familiarity with medical roleplay nomenclature', 'Defensive tactical ambulance operation', 'Absolute humanitarian neutrality in conflict zones'],
        duties: ['Rapid response trauma dispatch', 'In-hospital surgical roleplay care', 'Distributing emergency medkits and pharmaceutical items']
      }
    }
  },
  {
    id: 'job_mechanic',
    slug: 'customs-mechanic',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    salaryMin: 2800,
    salaryMax: 5400,
    status: 'HIRING_OPEN',
    translations: {
      ar: {
        name: 'كراج التعديل والصيانة الفاخرة (Prime Customs)',
        description: 'صيانة وتعديل محركات المركبات، فحص الشاسيه، وتركيب الحزم الرياضية المخصصة لعشاق السرعة.',
        requirements: ['شغف بالسيارات وميكانيكا التعديل', 'مهارات تواصل وخدمة عملاء ممتازة', 'الالتزام بأسعار ورسوم الكراج المعتمدة رسمياً'],
        duties: ['إصلاح المركبات المتضررة في الحوادث', 'تعديل المحركات ونظام التوربو والنيتروس', 'صبغ وتزيين هياكل السيارات حسب طلب الزبائن']
      },
      en: {
        name: 'Prime Customs Tuning Works',
        description: 'Mechanical overhaul, suspension diagnostics, and bespoke aesthetic tuning for automotive connoisseurs.',
        requirements: ['Appreciation for automotive engineering', 'Customer consultation etiquette', 'Strict adherence to standardized pricing schedules'],
        duties: ['Repairing collision damages and structural alignment', 'Calibrating forced-induction turbochargers and brake pads', 'Applying custom metallic paints and carbon bodykits']
      }
    }
  },
  {
    id: 'job_business',
    slug: 'enterprises-dealership',
    category: 'BUSINESS',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    salaryMin: 3000,
    salaryMax: 9000,
    status: 'INVITE_ONLY',
    translations: {
      ar: {
        name: 'وكالة السيارات الفاخرة والمزادات',
        description: 'استيراد وبيع المركبات الحصرية، تنظيم مزادات النخبة العلنية، وإدارة صفقات رجال الأعمال الكبرى.',
        requirements: ['سجل مالي نظيف وخبرة في التجارة', 'رأس مال استثماري وإدارة المعارض', 'علاقات عامة وتفاوض رفيع المستوى'],
        duties: ['عرض وبيع السيارات المستوردة', 'تنظيم المزادات الشهرية للمركبات النادرة', 'إبرام عقود التمويل وتأجير الأساطيل']
      },
      en: {
        name: 'Apex Luxury Dealership & Auctions',
        description: 'Import and broker high-end exotic motorcars, host high-stakes auctions, and orchestrate commercial corporate transactions.',
        requirements: ['Clean financial ledger and business acumen', 'Capital liquidity and showroom floor management', 'Elite negotiation and client relations capability'],
        duties: ['Exotic showroom floor sales and vehicle demonstrations', 'Coordinating monthly public rare vehicle auctions', 'Managing fleet corporate leasing contracts']
      }
    }
  }
];

export const initialProducts: ProductItem[] = [
  {
    id: 'prod_vip_gold',
    slug: 'vip-gold-membership',
    category: 'VIP',
    price: 35,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    stock: 99,
    status: 'ACTIVE',
    featured: true,
    translations: {
      ar: {
        name: 'عضوية VIP Gold الملكية (شهر)',
        description: 'الباقة الذهبية المتكاملة التي تمنحك الأسبقية والراحة التامة في كل جوانب اللعب.',
        perks: [
          'أولوية دخول متقدمة لقائمة الانتظار (Queue Priority Tier 2)',
          'كراج سيارات إضافي يتسع لـ 5 سيارات خاصة',
          'لوحة أرقام مميزة مخصصة تختارها بنفسك',
          'رتبة VIP ولون خاص داخل سيرفر الديسكورد',
          'راتب إضافي 15% في جميع الوظائف الحكومية والخاصة'
        ]
      },
      en: {
        name: 'VIP Gold Royal Pass (Monthly)',
        description: 'Comprehensive gold-tier subscription delivering high-priority queue pass and prestigious amenities.',
        perks: [
          'High Queue Priority Access (Tier 2)',
          'Extended garage capacity accommodating 5 extra personal vehicles',
          'Custom prestige vanity license plate assignment',
          'Exclusive Discord VIP badge and distinctive role color',
          '15% wage booster across all registered occupations'
        ]
      }
    }
  },
  {
    id: 'prod_vip_black',
    slug: 'vip-black-card',
    category: 'VIP',
    price: 75,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    stock: 45,
    status: 'ACTIVE',
    featured: true,
    translations: {
      ar: {
        name: 'بطاقة Prime Black Card الفاخرة (دائمة)',
        description: 'أعلى وأرقى باقة داعمين في Prime RP لمواطني النخبة الباحثين عن التميز المطلق.',
        perks: [
          'أولوية دخول قصوى فورية (Tier 1 Instant Queue Bypass)',
          'شقة بنتهاوس فاخرة مع مهبط طائرات وكراج 10 سيارات',
          'مركبة رياضية نادرة مخصصة من الفئة الأولى',
          'أيقونة تاج ذهبي مميزة بجانب اسمك في القوائم',
          'حق الوصول الحصري لقناة أعضاء النخبة في الديسكورد'
        ]
      },
      en: {
        name: 'Prime Black Card Lifetime Edition',
        description: 'The pinnacle tier for prestigious supporters seeking uncompromised prominence within the city.',
        perks: [
          'Tier 1 Instant Priority Queue Bypass',
          'Luxury Penthouse deed complete with helipad and 10-car showroom garage',
          'Exclusive customized exotic supercar asset allocation',
          'Golden crown insignia displayed alongside in-game telemetry',
          'Private access to Executive Discord Boardroom channels'
        ]
      }
    }
  },
  {
    id: 'prod_custom_vehicle',
    slug: 'custom-exotic-vehicle-slot',
    category: 'VEHICLES',
    price: 49,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    stock: 20,
    status: 'ACTIVE',
    featured: false,
    translations: {
      ar: {
        name: 'حزمة استيراد مركبة حصرية (Exotic Vehicle Import)',
        description: 'احصل على سيارة أحلامك المعدلة بمواصفات حصرية وصوت محرك جبار مع صيانة مجانية لمدة 6 أشهر.',
        perks: [
          'تعديلات فيزيائية مخصصة (Custom Handling & Sound)',
          'تأمين شامل ضد السرقة والتلف داخل المدينة',
          'مفتاحين للمركبة قابلين للإعارة'
        ]
      },
      en: {
        name: 'Exotic Custom Vehicle Import Package',
        description: 'Procure your bespoke performance machine with exclusive engine sound profiles and six months of prepaid warranty.',
        perks: [
          'Custom calibrated handling data and aggressive exhaust acoustics',
          'Comprehensive in-city insurance policy protection',
          'Two digital smart keys with shareable proxy privileges'
        ]
      }
    }
  }
];

export const initialFAQ: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'عام',
    order: 1,
    translations: {
      ar: {
        question: 'كيف يمكنني الانضمام واللعب في سيرفر Prime RP؟',
        answer: 'كل ما عليك فعله هو تثبيت لعبة GTA V الأصلية وبرنامج FiveM، ثم الانضمام إلى سيرفر الديسكورد الرسمي وقراءة القوانين العامة. بعد ذلك، يمكنك الضغط على زر "العب الآن" في موقعنا للدخول مباشرة.'
      },
      en: {
        question: 'How do I connect and begin roleplaying in Prime RP?',
        answer: 'Install legitimate GTA V and the official FiveM client, join our community Discord to review server statutes, and utilize the "Play Now" launcher on this website.'
      }
    }
  },
  {
    id: 'faq_2',
    category: 'المصادقة والديسكورد',
    order: 2,
    translations: {
      ar: {
        question: 'لماذا يجب علي تسجيل الدخول باستخدام حساب Discord؟',
        answer: 'تسجيل الدخول عبر ديسكورد يوفر أعلى درجات الأمان وحماية الهوية، كما يتيح مزامنة رتبك وتذاكر الدعم وسجل مشترياتك في منصة واحدة دون الحاجة لتسجيل كلمات مرور جديدة.'
      },
      en: {
        question: 'Why is Discord OAuth required for website authentication?',
        answer: 'Discord authentication guarantees enterprise identity security, enabling automatic role synchronization, streamlined support ticketing, and order tracking without traditional password vulnerabilities.'
      }
    }
  },
  {
    id: 'faq_3',
    category: 'القوانين والدعم',
    order: 3,
    translations: {
      ar: {
        question: 'ماذا أفعل إذا تعرضت لمخالفة من لاعب آخر داخل السيرفر؟',
        answer: 'احرص على تسجيل مقطع فيديو للواقعة وتجنب الرد بالمثل أو كسر الشخصية. توجه فوراً إلى صفحة "الدعم الفني" في هذا الموقع وافتح تذكرة من نوع "بلاغ" مع إرفاق الرابط وسيتولى المشرفون التحقيق فوراً.'
      },
      en: {
        question: 'What protocol should I follow if another citizen breaks roleplay rules?',
        answer: 'Capture video telemetry of the incident while remaining fully in character. Then navigate to our Support Portal to log a report ticket with the footage for moderator inquiry.'
      }
    }
  }
];

export const initialSocialLinks = [
  { id: 'soc_1', platform: 'DISCORD', url: 'https://discord.gg/primerp', label: 'Discord', isActive: true, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'soc_2', platform: 'YOUTUBE', url: 'https://youtube.com/@primerp', label: 'YouTube', isActive: true, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'soc_3', platform: 'TWITTER', url: 'https://x.com/primerp', label: 'Twitter / X', isActive: true, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'soc_4', platform: 'TIKTOK', url: 'https://tiktok.com/@primerp', label: 'TikTok', isActive: true, createdAt: new Date('2026-01-01').toISOString() }
];

export const initialReports = [];
