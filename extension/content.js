  class ContextAnalyzer {
    constructor() {
      this.contextData = {
        pageType: null,
        emotionalTone: null,
        activityLevel: "low",
        keywords: [],
        category: null,
        confidence: 0,
      };

      this.emotionalKeywords = {
        wisdom: [
          // English
          "self-knowledge",
          "wisdom",
          "understanding",
          "virtue",
          "introspection",
          "awareness",
          "conscience",
          "self-discovery",
          "discovery",
          "enlightenment",
          "insight",
          "perspicacity",
          "reflection",
          "contemplation",
          "unity",
          "synthesis",
          "wholeness",
          "integration",
          "harmony",
          "collaboration",
          "knowledge",
          "courage",
          "autonomy",
          "thinking",
          "independence",
          "reason",
          "self-reliance",
          "wonder",
          "awe",
          "admiration",
          "morality",
          "nature",
          "universe",
          "law",
          "ethics",
          "perspective",
          "truth",
          "power",
          "soul",
          "innocence",
          "healing",
          "simplicity",
          "purity",
          "children",
          "peace",
          "restoration",
          "comfort",
          "humility",
          "ignorance",
          "modesty",
          "recognition",
          "water",
          "mountains",
          "symbolism",
          "change",
          "stability",
          "joy",
          "delight",
          // French
          "connaissance de soi",
          "sagesse",
          "comprehension",
          "vertu",
          "introspection",
          "conscience",
          "decouverte de soi",
          "eveil",
          "illumination",
          "perspicacite",
          "reflexion",
          "contemplation",
          "unite",
          "synthese",
          "totalite",
          "integration",
          "harmonie",
          "collaboration",
          "connaissance",
          "courage",
          "autonomie",
          "pensee",
          "independance",
          "raison",
          "autonomie personnelle",
          "emerveillement",
          "admiration",
          "moralite",
          "nature",
          "univers",
          "loi",
          "ethique",
          "perspective",
          "verite",
          "pouvoir",
          "ame",
          "innocence",
          "guerison",
          "simplicite",
          "purete",
          "enfants",
          "paix",
          "reparation",
          "reconfort",
          "humilite",
          "ignorance",
          "modestie",
          "reconnaissance",
          "eau",
          "montagnes",
          "symbolisme",
          "changement",
          "stabilite",
          // Arabic (normalized without diacritics)
          "معرفة الذات",
          "حكمة",
          "فهم",
          "فضيلة",
          "استبطان",
          "وعي",
          "اكتشاف الذات",
          "استنارة",
          "بصيرة",
          "تأمل",
          "وحدة",
          "تركيب",
          "تكامل",
          "انسجام",
          "تعاون",
          "معرفة",
          "شجاعة",
          "استقلالية",
          "تفكير",
          "استقلال",
          "عقل",
          "دهشة",
          "اخلاق",
          "ضمير",
          "طبيعة",
          "كون",
          "قانون",
          "منظور",
          "حقيقة",
          "قوة",
          "روح",
          "براءة",
          "شفاء",
          "بساطة",
          "نقاء",
          "اطفال",
          "سلام",
          "راحة",
          "تواضع",
          "جهل",
          "اعتراف",
          "ماء",
          "جبال",
          "تغيير",
          "استقرار",
          "فرح",
        ],

        learning: [
          // English
          "education",
          "learning",
          "apprentissage",
          "open-mindedness",
          "critical thinking",
          "intellectual",
          "analysis",
          "objectivity",
          "study",
          "mind",
          "tolerance",
          "scepticism",
          "examination",
          "evaluation",
          "judgment",
          "discernment",
          "curiosity",
          "doubt",
          "investigation",
          "research",
          "free thought",
          "flexibility",
          "intelligence",
          "rationality",
          "information",
          "knowledge",
          "science",
          "academic",
          "training",
          "teaching",
          "growth",
          "development",
          "transformation",
          "awareness",
          "discipline",
          "reward",
          "perseverance",
          "achievement",
          "pain",
          "suffering",
          "depth",
          "sensitivity",
          "realism",
          "inquiry",
          "honesty",
          "fearlessness",
          "limits",
          "philosophy",
          "senses",
          "experience",
          "cognition",
          "perception",
          "meaning",
          "purpose",
          "will",
          "endurance",
          "resilience",
          "motivation",
          "strength",
          "creativity",
          "movement",
          "inspiration",
          "greatness",
          "idea",
          "walk",
          "physicality",
          "concentration",
          "meditation",
          "connection",
          "thinking",
          "clarity",
          "focus",
          "order",
          "cultivation",
          // French
          "education",
          "apprentissage",
          "ouverture desprit",
          "pensee critique",
          "intellectuel",
          "analyse",
          "objectivite",
          "etude",
          "esprit",
          "tolerance",
          "scepticisme",
          "examen",
          "evaluation",
          "jugement",
          "discernement",
          "curiosite",
          "doute",
          "investigation",
          "recherche",
          "pensee libre",
          "flexibilite",
          "intelligence",
          "rationalite",
          "information",
          "connaissance",
          "science",
          "academique",
          "formation",
          "enseignement",
          "croissance",
          "developpement",
          "transformation",
          "conscience",
          "discipline",
          "recompense",
          "perseverance",
          "accomplissement",
          "douleur",
          "souffrance",
          "profondeur",
          "sensibilite",
          "realisme",
          "enquete",
          "honnetet",
          "intrepidite",
          "limites",
          "philosophie",
          "sens",
          "experience",
          "cognition",
          "perception",
          "sens",
          "but",
          "volonte",
          "endurance",
          "resilience",
          "motivation",
          "force",
          "creativite",
          "mouvement",
          "inspiration",
          "grandeur",
          "idee",
          "marche",
          "concentration",
          "meditation",
          "connexion",
          "pensee",
          "clarte",
          "concentration",
          "ordre",
          // Arabic
          "تعليم",
          "تعلم",
          "انفتاح",
          "تفكير نقدي",
          "فكري",
          "تحليل",
          "موضوعية",
          "دراسة",
          "عقل",
          "تسامح",
          "شك",
          "فحص",
          "تقييم",
          "حكم",
          "تمييز",
          "فضول",
          "شك",
          "تحقيق",
          "بحث",
          "فكر حر",
          "مرونة",
          "ذكاء",
          "عقلانية",
          "معلومات",
          "معرفة",
          "علم",
          "اكاديمي",
          "تدريب",
          "تعليم",
          "نمو",
          "تطوير",
          "تحول",
          "وعي",
          "انضباط",
          "مكافأة",
          "مثابرة",
          "انجاز",
          "الم",
          "معاناة",
          "عمق",
          "حساسية",
          "واقعية",
          "استفسار",
          "صدق",
          "جرأة",
          "حدود",
          "فلسفة",
          "حواس",
          "تجربة",
          "ادراك",
          "معنى",
          "هدف",
          "ارادة",
          "صبر",
          "مرونة",
          "حافز",
          "قوة",
          "ابداع",
          "حركة",
          "الهام",
          "عظمة",
          "فكرة",
          "مشي",
          "تركيز",
          "تأمل",
        ],

        ethics: [
          // English
          "habit",
          "virtue",
          "ethics",
          "excellence",
          "practice",
          "discipline",
          "character",
          "behavior",
          "consistency",
          "routine",
          "mastery",
          "quality",
          "standards",
          "categorical imperative",
          "duty",
          "morality",
          "universal law",
          "principle",
          "obligation",
          "responsibility",
          "conduct",
          "maxim",
          "compassion",
          "cruelty",
          "kindness",
          "empathy",
          "humanity",
          "integrity",
          "worthiness",
          "good and evil",
          "power",
          "creation",
          "values",
          "determination",
          "love",
          "acceptance",
          "understanding",
          "relationship",
          "care",
          "selfless",
          "altruism",
          "sacrifice",
          "compromise",
          "balance",
          "moderation",
          "action",
          "honesty",
          "improvement",
          "example",
          "rectitude",
          "leadership",
          "influence",
          "governance",
          "respect",
          "sincerity",
          "trust",
          "modesty",
          "deeds",
          "superior man",
          // French
          "habitude",
          "vertu",
          "ethique",
          "excellence",
          "pratique",
          "discipline",
          "caractere",
          "comportement",
          "coherence",
          "routine",
          "maitrise",
          "qualite",
          "normes",
          "imperatif categorique",
          "devoir",
          "moralite",
          "loi universelle",
          "principe",
          "obligation",
          "responsabilite",
          "conduite",
          "maxime",
          "compassion",
          "cruaute",
          "gentillesse",
          "empathie",
          "humanite",
          "integrite",
          "dignite",
          "bien et mal",
          "pouvoir",
          "creation",
          "valeurs",
          "determination",
          "amour",
          "acceptation",
          "comprehension",
          "relation",
          "soin",
          "altruiste",
          "altruisme",
          "sacrifice",
          "compromis",
          "equilibre",
          "moderation",
          "action",
          "honnetete",
          "amelioration",
          "exemple",
          "droiture",
          "direction",
          "influence",
          "gouvernance",
          "respect",
          "sincerite",
          "confiance",
          "modestie",
          "actes",
          // Arabic
          "عادة",
          "فضيلة",
          "اخلاق",
          "تميز",
          "ممارسة",
          "انضباط",
          "شخصية",
          "سلوك",
          "اتساق",
          "روتين",
          "اتقان",
          "جودة",
          "معايير",
          "واجب",
          "اخلاقية",
          "قانون عالمي",
          "مبدأ",
          "التزام",
          "مسؤولية",
          "تصرف",
          "شفقة",
          "قسوة",
          "لطف",
          "تعاطف",
          "انسانية",
          "نزاهة",
          "جدارة",
          "خير وشر",
          "قوة",
          "خلق",
          "قيم",
          "عزم",
          "حب",
          "قبول",
          "فهم",
          "علاقة",
          "رعاية",
          "ايثار",
          "تضحية",
          "تسوية",
          "توازن",
          "اعتدال",
          "عمل",
          "صدق",
          "تحسين",
          "مثال",
          "استقامة",
          "قيادة",
          "تأثير",
          "احترام",
          "اخلاص",
          "ثقة",
          "تواضع",
          "افعال",
        ],

        life: [
          // English
          "human nature",
          "society",
          "politics",
          "community",
          "social",
          "civilization",
          "collective",
          "belonging",
          "connection",
          "relationships",
          "dignity",
          "obligation",
          "respect",
          "worth",
          "value",
          "humanity",
          "imperfection",
          "reality",
          "limitation",
          "flaws",
          "acceptance",
          "pragmatism",
          "will to power",
          "life",
          "strength",
          "drive",
          "motivation",
          "ambition",
          "vitality",
          "energy",
          "existence",
          "mystery",
          "time",
          "dedication",
          "meaning",
          "purpose",
          "survival",
          "living",
          "quest",
          "fulfillment",
          "judgment",
          "forgiveness",
          "guilt",
          "fear",
          "self-awareness",
          "identity",
          "death",
          "comfort",
          "psychology",
          "suffering",
          "escape",
          "relief",
          "nihilism",
          "despair",
          "hope",
          "darkness",
          "control",
          "thought",
          "crisis",
          "family",
          "happiness",
          "uniqueness",
          "patterns",
          "tragedy",
          "filial piety",
          "tradition",
          "honor",
          "elders",
          "roots",
          "foundation",
          "hierarchy",
          "culture",
          "benevolence",
          // French
          "nature humaine",
          "societe",
          "politique",
          "communaute",
          "social",
          "civilisation",
          "collectif",
          "appartenance",
          "connexion",
          "relations",
          "dignite",
          "obligation",
          "respect",
          "valeur",
          "humanite",
          "imperfection",
          "realite",
          "limitation",
          "defauts",
          "acceptation",
          "pragmatisme",
          "volonte de puissance",
          "vie",
          "force",
          "motivation",
          "ambition",
          "vitalite",
          "energie",
          "existence",
          "mystere",
          "temps",
          "devouement",
          "sens",
          "but",
          "survie",
          "vivre",
          "quete",
          "accomplissement",
          "jugement",
          "pardon",
          "culpabilite",
          "peur",
          "conscience de soi",
          "identite",
          "mort",
          "reconfort",
          "psychologie",
          "souffrance",
          "evasion",
          "soulagement",
          "nihilisme",
          "desespoir",
          "espoir",
          "obscurite",
          "controle",
          "pensee",
          "crise",
          "famille",
          "bonheur",
          "unicite",
          "modeles",
          "tragedie",
          "piete filiale",
          "tradition",
          "honneur",
          "aines",
          "racines",
          "fondation",
          "hierarchie",
          "culture",
          // Arabic
          "طبيعة بشرية",
          "مجتمع",
          "سياسة",
          "جماعة",
          "اجتماعي",
          "حضارة",
          "جماعي",
          "انتماء",
          "اتصال",
          "علاقات",
          "كرامة",
          "التزام",
          "احترام",
          "قيمة",
          "انسانية",
          "نقص",
          "واقع",
          "قيد",
          "عيوب",
          "قبول",
          "براغماتية",
          "ارادة القوة",
          "حياة",
          "قوة",
          "دافع",
          "حافز",
          "طموح",
          "حيوية",
          "طاقة",
          "وجود",
          "غموض",
          "زمن",
          "تفاني",
          "معنى",
          "هدف",
          "بقاء",
          "عيش",
          "بحث",
          "انجاز",
          "حكم",
          "غفران",
          "ذنب",
          "خوف",
          "وعي بالذات",
          "هوية",
          "موت",
          "راحة",
          "علم النفس",
          "معاناة",
          "هروب",
          "عدمية",
          "يأس",
          "امل",
          "ظلام",
          "تحكم",
          "فكرة",
          "ازمة",
          "عائلة",
          "سعادة",
          "تفرد",
          "انماط",
          "مأساة",
          "بر الوالدين",
          "تقليد",
          "شرف",
          "كبار السن",
        ],

        action: [
          // English
          "friendship",
          "loyalty",
          "companionship",
          "trust",
          "bond",
          "solidarity",
          "patience",
          "perseverance",
          "endurance",
          "reward",
          "waiting",
          "persistence",
          "resilience",
          "fortitude",
          "duty",
          "action",
          "moral law",
          "commitment",
          "creation",
          "chaos",
          "creativity",
          "transformation",
          "power",
          "birth",
          "genius",
          "strength",
          "adversity",
          "growth",
          "overcoming",
          "discipline",
          "challenge",
          "pain",
          "survival",
          "resistance",
          "experience",
          "lesson",
          "determination",
          "fear",
          "courage",
          "change",
          "risk",
          "boldness",
          "initiative",
          "innovation",
          "self",
          "improvement",
          "reform",
          "personal",
          "words",
          "deeds",
          "reality",
          "integrity",
          "authenticity",
          "practice",
          "truth",
          "performance",
          "effort",
          "superior man",
          "conduct",
          "priorities",
          "principles",
          "virtue",
          "inspiration",
          "emulation",
          "aspiration",
          "development",
          "dedication",
          "wholeness",
          "passion",
          "sincerity",
          "purpose",
          "presence",
          "excellence",
          "concentration",
          "mindfulness",
          "conviction",
          "heart",
          // French
          "amitie",
          "loyaute",
          "compagnonnage",
          "confiance",
          "lien",
          "solidarite",
          "patience",
          "perseverance",
          "endurance",
          "recompense",
          "attente",
          "persistance",
          "resilience",
          "fortitude",
          "devoir",
          "action",
          "loi morale",
          "engagement",
          "creation",
          "chaos",
          "creativite",
          "transformation",
          "pouvoir",
          "naissance",
          "genie",
          "force",
          "adversite",
          "croissance",
          "depassement",
          "discipline",
          "defi",
          "douleur",
          "survie",
          "resistance",
          "experience",
          "lecon",
          "determination",
          "peur",
          "courage",
          "changement",
          "risque",
          "audace",
          "initiative",
          "innovation",
          "soi",
          "amelioration",
          "reforme",
          "personnel",
          "mots",
          "actes",
          "realite",
          "integrite",
          "authenticite",
          "pratique",
          "verite",
          "performance",
          "effort",
          "homme superieur",
          "conduite",
          "priorites",
          "principes",
          "vertu",
          "inspiration",
          "emulation",
          "aspiration",
          "developpement",
          "devouement",
          "integralite",
          "passion",
          "sincerite",
          "but",
          "presence",
          "excellence",
          "concentration",
          "conviction",
          "coeur",
          // Arabic
          "صداقة",
          "ولاء",
          "رفقة",
          "ثقة",
          "رابطة",
          "تضامن",
          "صبر",
          "مثابرة",
          "تحمل",
          "مكافأة",
          "انتظار",
          "اصرار",
          "مرونة",
          "شجاعة",
          "واجب",
          "عمل",
          "قانون اخلاقي",
          "التزام",
          "خلق",
          "فوضى",
          "ابداع",
          "تحول",
          "قوة",
          "ولادة",
          "عبقرية",
          "محنة",
          "نمو",
          "تغلب",
          "انضباط",
          "تحدي",
          "الم",
          "بقاء",
          "مقاومة",
          "تجربة",
          "درس",
          "عزم",
          "خوف",
          "شجاعة",
          "تغيير",
          "مخاطرة",
          "جرأة",
          "مبادرة",
          "ابتكار",
          "ذات",
          "تحسين",
          "اصلاح",
          "شخصي",
          "كلمات",
          "افعال",
          "واقع",
          "نزاهة",
          "اصالة",
          "ممارسة",
          "حقيقة",
          "اداء",
          "جهد",
          "رجل متفوق",
          "سلوك",
          "اولويات",
          "مبادئ",
          "فضيلة",
          "الهام",
          "منافسة",
          "طموح",
          "تطور",
          "تفاني",
          "كمال",
          "شغف",
          "اخلاص",
          "غاية",
          "حضور",
          "تميز",
          "تركيز",
          "قناعة",
          "قلب",
        ],

        freedom: [
          // English
          "happiness",
          "freedom",
          "character",
          "independence",
          "well-being",
          "inner peace",
          "self-reliance",
          "autonomy",
          "contentment",
          "flourishing",
          "eudaimonia",
          "courage",
          "criticism",
          "boldness",
          "risk",
          "authenticity",
          "self-expression",
          "initiative",
          "inaction",
          "silence",
          "fear",
          "conformity",
          "mediocrity",
          "visibility",
          "opinion",
          "passivity",
          "temerity",
          "originality",
          "will",
          "self-determination",
          "sovereignty",
          "choice",
          "agency",
          "self-governance",
          "self-creation",
          "transcendence",
          "overcoming",
          "liberation",
          "identity",
          "individuality",
          "potential",
          "becoming",
          "destiny",
          "systems",
          "truth",
          "rebellion",
          "thinking",
          "reality",
          "distortion",
          "simplicity",
          "renunciation",
          "society",
          "minimalism",
          "spiritual",
          "consumerism",
          "self-control",
          "purity",
          "social order",
          "role",
          "harmony",
          "peace",
          "responsibility",
          "balance",
          "anxiety",
          "function",
          "tranquility",
          "fulfillment",
          // French
          "bonheur",
          "liberte",
          "caractere",
          "independance",
          "bien-etre",
          "paix interieure",
          "autonomie personnelle",
          "autonomie",
          "contentement",
          "epanouissement",
          "eudaimonia",
          "courage",
          "critique",
          "audace",
          "risque",
          "authenticite",
          "expression de soi",
          "initiative",
          "inaction",
          "silence",
          "peur",
          "conformite",
          "mediocrite",
          "visibilite",
          "opinion",
          "passivite",
          "temerite",
          "originalite",
          "volonte",
          "autodetermination",
          "souverainete",
          "choix",
          "agence",
          "autogouvernance",
          "creation de soi",
          "transcendance",
          "depassement",
          "liberation",
          "identite",
          "individualite",
          "potentiel",
          "devenir",
          "destin",
          "systemes",
          "verite",
          "rebellion",
          "pensee",
          "realite",
          "distorsion",
          "simplicite",
          "renonciation",
          "societe",
          "minimalisme",
          "spirituel",
          "consumerisme",
          "maitrise de soi",
          "purete",
          "ordre social",
          "role",
          "harmonie",
          "paix",
          "responsabilite",
          "equilibre",
          "anxiete",
          "fonction",
          "tranquillite",
          "accomplissement",
          // Arabic
          "سعادة",
          "حرية",
          "شخصية",
          "استقلال",
          "رفاهية",
          "سلام داخلي",
          "اعتماد على النفس",
          "استقلالية",
          "رضا",
          "ازدهار",
          "شجاعة",
          "نقد",
          "جرأة",
          "مخاطرة",
          "اصالة",
          "تعبير عن الذات",
          "مبادرة",
          "خمول",
          "صمت",
          "خوف",
          "مطابقة",
          "رؤية",
          "رأي",
          "سلبية",
          "اصالة",
          "ارادة",
          "تقرير المصير",
          "سيادة",
          "اختيار",
          "وكالة",
          "حكم ذاتي",
          "خلق الذات",
          "تعالي",
          "تجاوز",
          "تحرر",
          "هوية",
          "فردية",
          "امكانات",
          "صيرورة",
          "مصير",
          "انظمة",
          "حقيقة",
          "تمرد",
          "تفكير",
          "واقع",
          "تشويه",
          "بساطة",
          "تنازل",
          "مجتمع",
          "بساطة",
          "روحي",
          "استهلاك",
          "تحكم ذاتي",
          "نقاء",
          "نظام اجتماعي",
          "دور",
          "انسجام",
          "سلام",
          "مسؤولية",
          "توازن",
          "قلق",
          "وظيفة",
          "هدوء",
          "انجاز",
        ],

        faith: [
          // English
          "faith",
          "religion",
          "spirituality",
          "belief",
          "god",
          "divine",
          "sacred",
          "prayer",
          "devotion",
          "trust",
          "hope",
          "redemption",
          "grace",
          "mercy",
          "salvation",
          "soul",
          "spirit",
          "transcendence",
          "mystery",
          "revelation",
          "enlightenment",
          "peace",
          "love",
          "forgiveness",
          "compassion",
          "service",
          "humility",
          "obedience",
          "surrender",
          "acceptance",
          "suffering",
          "cross",
          "sacrifice",
          "purity",
          "christian",
          "spiritual",
          "depth",
          // French
          "foi",
          "religion",
          "spiritualite",
          "croyance",
          "dieu",
          "divin",
          "sacre",
          "priere",
          "devotion",
          "confiance",
          "espoir",
          "redemption",
          "grace",
          "misericorde",
          "salut",
          "ame",
          "esprit",
          "transcendance",
          "mystere",
          "revelation",
          "eveil",
          "paix",
          "amour",
          "pardon",
          "compassion",
          "service",
          "humilite",
          "obeissance",
          "abandon",
          "acceptation",
          "souffrance",
          "croix",
          "sacrifice",
          "purete",
          "chretien",
          "spirituel",
          "profondeur",
          // Arabic
          "ايمان",
          "دين",
          "روحانية",
          "اعتقاد",
          "الله",
          "الهي",
          "مقدس",
          "صلاة",
          "تفاني",
          "ثقة",
          "امل",
          "خلاص",
          "نعمة",
          "رحمة",
          "خلاص",
          "روح",
          "روحانية",
          "تعالي",
          "غموض",
          "وحي",
          "استنارة",
          "سلام",
          "حب",
          "غفران",
          "شفقة",
          "خدمة",
          "تواضع",
          "طاعة",
          "استسلام",
          "قبول",
          "معاناة",
          "صليب",
          "تضحية",
          "نقاء",
          "مسيحي",
          "روحي",
          "عمق",
        ],

        reason: [
          // English
          "reason",
          "intellect",
          "logic",
          "faculty",
          "rationality",
          "thinking",
          "mind",
          "cognition",
          "intelligence",
          "wisdom",
          "supreme",
          "superior",
          "analysis",
          "science",
          "method",
          "argument",
          "demonstration",
          "philosophy",
          "knowledge",
          "brain",
          "understanding",
          "truth",
          "research",
          "deduction",
          "judgment",
          "critique",
          "objective",
          "clear thought",
          "moral law",
          "rational",
          "objectivity",
          "illusion",
          "perspective",
          "power",
          "interpretation",
          "relativity",
          "creation",
          "pure reason",
          "love",
          "heart",
          "emotion",
          "insight",
          "righteousness",
          "values",
          "principles",
          "discernment",
          "evidence",
          "facts",
          "inquiry",
          "investigation",
          // French
          "raison",
          "intellect",
          "logique",
          "faculte",
          "rationalite",
          "pensee",
          "esprit",
          "cognition",
          "intelligence",
          "sagesse",
          "supreme",
          "superieur",
          "analyse",
          "science",
          "methode",
          "argument",
          "demonstration",
          "philosophie",
          "connaissance",
          "cerveau",
          "comprehension",
          "verite",
          "recherche",
          "deduction",
          "jugement",
          "critique",
          "objectif",
          "pensee claire",
          "loi morale",
          "rationnel",
          "objectivite",
          "illusion",
          "perspective",
          "pouvoir",
          "interpretation",
          "relativite",
          "creation",
          "raison pure",
          "amour",
          "coeur",
          "emotion",
          "perspicacite",
          "droiture",
          "valeurs",
          "principes",
          "discernement",
          "preuve",
          "faits",
          "enquete",
          "investigation",
          // Arabic
          "عقل",
          "فكر",
          "منطق",
          "ملكة",
          "عقلانية",
          "تفكير",
          "ذهن",
          "ادراك",
          "ذكاء",
          "حكمة",
          "الاسمى",
          "الافضل",
          "تحليل",
          "علم",
          "منهج",
          "حجة",
          "برهان",
          "فلسفة",
          "معرفة",
          "دماغ",
          "فهم",
          "حقيقة",
          "بحث",
          "استنتاج",
          "حكم",
          "نقد",
          "موضوعي",
          "فكر واضح",
          "قانون اخلاقي",
          "عقلاني",
          "موضوعية",
          "وهم",
          "منظور",
          "قوة",
          "تفسير",
          "نسبية",
          "خلق",
          "عقل خالص",
          "حب",
          "قلب",
          "عاطفة",
          "بصيرة",
          "صلاح",
          "قيم",
          "مبادئ",
          "تمييز",
          "دليل",
          "حقائق",
          "استفسار",
          "تحقيق",
        ],

        social: [
          // English
          "justice",
          "state",
          "society",
          "good life",
          "flourishing",
          "civilization",
          "governance",
          "community",
          "prosperity",
          "welfare",
          "universal",
          "dignity",
          "humanity",
          "respect",
          "morality",
          "rights",
          "equality",
          "fairness",
          "herd morality",
          "weakness",
          "conformity",
          "rebellion",
          "independence",
          "values",
          "suppression",
          "ressentiment",
          "democracy",
          "tyranny",
          "individual",
          "mass",
          "social critique",
          "mediocrity",
          "aristocracy",
          "individuality",
          "tribe",
          "struggle",
          "resistance",
          "overwhelmed",
          "oppression",
          "non-conformity",
          "solitude",
          "norm",
          "groups",
          "crowds",
          "irrationality",
          "psychology",
          "observation",
          "measure",
          "treatment",
          "compassion",
          "empathy",
          "forgiveness",
          "pacifism",
          "violence",
          "non-resistance",
          "social harmony",
          "order",
          "nation",
          "conduct",
          "benevolence",
          "love",
          "ethics",
          "harmony",
          "ren",
          "crimes",
          "principles",
          "consequences",
          "irony",
          "hypocrisy",
          "ideology",
          "justification",
          "evil",
          "war",
          "politics",
          "tragedy",
          "religion",
          "ends",
          "means",
          "injustice",
          "deception",
          "righteousness",
          // French
          "justice",
          "etat",
          "societe",
          "bonne vie",
          "epanouissement",
          "civilisation",
          "gouvernance",
          "communaute",
          "prosperite",
          "bien-etre",
          "universel",
          "dignite",
          "humanite",
          "respect",
          "moralite",
          "droits",
          "egalite",
          "equite",
          "morale du troupeau",
          "faiblesse",
          "conformite",
          "rebellion",
          "independance",
          "valeurs",
          "suppression",
          "ressentiment",
          "democratie",
          "tyrannie",
          "individu",
          "masse",
          "critique sociale",
          "mediocrite",
          "aristocratie",
          "individualite",
          "tribu",
          "lutte",
          "resistance",
          "submerge",
          "oppression",
          "non-conformite",
          "solitude",
          "norme",
          "groupes",
          "foules",
          "irrationalite",
          "psychologie",
          "observation",
          "mesure",
          "traitement",
          "compassion",
          "empathie",
          "pardon",
          "pacifisme",
          "violence",
          "non-resistance",
          "harmonie sociale",
          "ordre",
          "nation",
          "conduite",
          "bienveillance",
          "amour",
          "ethique",
          "harmonie",
          "crimes",
          "principes",
          "consequences",
          "ironie",
          "hypocrisie",
          "ideologie",
          "justification",
          "mal",
          "guerre",
          "politique",
          "tragedie",
          "religion",
          "fins",
          "moyens",
          "injustice",
          "tromperie",
          "droiture",
          // Arabic
          "عدالة",
          "دولة",
          "مجتمع",
          "حياة جيدة",
          "ازدهار",
          "حضارة",
          "حكم",
          "جماعة",
          "رخاء",
          "رفاهية",
          "عالمي",
          "كرامة",
          "انسانية",
          "احترام",
          "اخلاقية",
          "حقوق",
          "مساواة",
          "عدل",
          "اخلاق القطيع",
          "ضعف",
          "امتثال",
          "تمرد",
          "استقلال",
          "قيم",
          "قمع",
          "استياء",
          "ديمقراطية",
          "استبداد",
          "فرد",
          "جماهير",
          "نقد اجتماعي",
          "رداءة",
          "ارستقراطية",
          "فردية",
          "قبيلة",
          "صراع",
          "مقاومة",
          "قمع",
          "عدم امتثال",
          "وحدة",
          "قاعدة",
          "مجموعات",
          "حشود",
          "لاعقلانية",
          "علم نفس",
          "ملاحظة",
          "قياس",
          "معاملة",
          "شفقة",
          "تعاطف",
          "غفران",
          "سلمية",
          "عنف",
          "عدم مقاومة",
          "انسجام اجتماعي",
          "نظام",
          "امة",
          "سلوك",
          "مودة",
          "حب",
          "اخلاق",
          "انسجام",
          "جرائم",
          "مبادئ",
          "عواقب",
          "سخرية",
          "نفاق",
          "ايديولوجيا",
          "تبرير",
          "شر",
          "حرب",
          "سياسة",
          "مأساة",
          "دين",
          "غايات",
          "وسائل",
          "ظلم",
          "خداع",
          "صلاح",
        ],

        happiness: [
          // English
          "happiness",
          "hope",
          "dreams",
          "optimism",
          "aspiration",
          "future",
          "possibility",
          "inspiration",
          "motivation",
          "vision",
          "virtue",
          "good",
          "unconditional",
          "absolute",
          "ideal",
          "excellence",
          "imagination",
          "desire",
          "feeling",
          "emotion",
          "self-overcoming",
          "achievement",
          "greatness",
          "mastery",
          "well-being",
          "suffering",
          "redemption",
          "awareness",
          "transformation",
          "fulfillment",
          "peace",
          "life",
          "purpose",
          "meaning",
          "service",
          "others",
          "contribution",
          "choice",
          "simplicity",
          "being",
          "contentment",
          "joy",
          "acceptance",
          "tranquility",
          "letting go",
          "waking dream",
          "inner",
          "character",
          "flourishing",
          "eudaimonia",
          "serenity",
          "satisfaction",
          "pleasure",
          "self-control",
          "destiny",
          "control",
          "fortune",
          "external",
          "internal",
          "change",
          "not the aim",
          "consciousness",
          "origin",
          "path",
          "healing",
          "growth",
          "enlightenment",
          "greatest happiness",
          "unhappiness",
          "source",
          "knowledge",
          "insight",
          "realization",
          "real",
          "faithfully",
          "naturally",
          "consequence",
          "discipline",
          "responsibility",
          "sincerity",
          "forgiveness",
          "letting go",
          "resentment",
          "memory",
          "release",
          "mindset",
          "past",
          "present",
          "calm",
          // French
          "bonheur",
          "espoir",
          "reves",
          "optimisme",
          "aspiration",
          "avenir",
          "possibilite",
          "inspiration",
          "motivation",
          "vision",
          "vertu",
          "bien",
          "inconditionnel",
          "absolu",
          "ideal",
          "excellence",
          "imagination",
          "desir",
          "sentiment",
          "emotion",
          "depassement de soi",
          "accomplissement",
          "grandeur",
          "maitrise",
          "bien-etre",
          "souffrance",
          "redemption",
          "conscience",
          "transformation",
          "epanouissement",
          "paix",
          "vie",
          "but",
          "sens",
          "service",
          "autres",
          "contribution",
          "choix",
          "simplicite",
          "etre",
          "contentement",
          "joie",
          "acceptation",
          "tranquillite",
          "lacher-prise",
          "reve eveille",
          "interieur",
          "caractere",
          "eudaimonia",
          "serenite",
          "satisfaction",
          "plaisir",
          "maitrise de soi",
          "destin",
          "controle",
          "fortune",
          "externe",
          "interne",
          "changement",
          "non le but",
          "conscience",
          "origine",
          "chemin",
          "guerison",
          "croissance",
          "illumination",
          "le plus grand bonheur",
          "malheur",
          "source",
          "connaissance",
          "perspicacite",
          "realisation",
          "reel",
          "fidelement",
          "naturellement",
          "consequence",
          "discipline",
          "responsabilite",
          "sincerite",
          "pardon",
          "lacher-prise",
          "ressentiment",
          "memoire",
          "liberation",
          "etat desprit",
          "passe",
          "present",
          "calme",
          // Arabic
          "سعادة",
          "امل",
          "احلام",
          "تفاؤل",
          "طموح",
          "مستقبل",
          "امكانية",
          "الهام",
          "حافز",
          "رؤية",
          "فضيلة",
          "خير",
          "غير مشروط",
          "مطلق",
          "مثالي",
          "تميز",
          "خيال",
          "رغبة",
          "شعور",
          "عاطفة",
          "تجاوز الذات",
          "انجاز",
          "عظمة",
          "اتقان",
          "رفاهية",
          "معاناة",
          "خلاص",
          "وعي",
          "تحول",
          "انجاز",
          "سلام",
          "حياة",
          "هدف",
          "معنى",
          "خدمة",
          "اخرون",
          "مساهمة",
          "اختيار",
          "بساطة",
          "كينونة",
          "رضا",
          "فرح",
          "قبول",
          "هدوء",
          "ترك",
          "حلم يقظة",
          "داخلي",
          "شخصية",
          "ازدهار",
          "سكينة",
          "رضا",
          "متعة",
          "ضبط النفس",
          "مصير",
          "تحكم",
          "حظ",
          "خارجي",
          "داخلي",
          "تغيير",
          "ليس الهدف",
          "وعي",
          "اصل",
          "طريق",
          "شفاء",
          "نمو",
          "استنارة",
          "السعادة العظمى",
          "تعاسة",
          "مصدر",
          "معرفة",
          "بصيرة",
          "ادراك",
          "حقيقي",
          "باخلاص",
          "طبيعيا",
          "نتيجة",
          "انضباط",
          "مسؤولية",
          "صدق",
          "غفران",
          "تخلي",
          "استياء",
          "ذاكرة",
          "تحرر",
          "عقلية",
          "ماضي",
          "حاضر",
          "هدوء",
        ],
      };

      this.categoryMapping = {
        wisdom: "Wisdom",
        learning: "Knowledge and learning",
        ethics: "Ethics and behavior",
        life: "Life and human nature",
        action: "Action and discipline",
        freedom: "Freedom",
        faith: "Faith",
        reason: "Reason and logic",
        social: "Society and Justice",
        happiness: "Happiness and well-being",
      };

      this.lastTriggerTime = 0;
      this.triggerInterval = 30000;
      this.lastScrollTime = Date.now();
      this.scrollCount = 0;
      this.maxScrolls = 10;
      this.inputCount = 0;
      this.lastInputTime = 0;
      this.maxInputs = 5;

      this.autoAnalysisInterval = null;
      this.isAutoAnalysisEnabled = true;

      this.initActivityTrackers();
      this.startAutoAnalysis();
    }

    startAutoAnalysis() {
      console.log("Auto-analysis started: every 30 seconds");

      setTimeout(() => {
        this.performAutoAnalysis();
      }, 5000);

      this.autoAnalysisInterval = setInterval(() => {
        if (this.isAutoAnalysisEnabled) {
          this.performAutoAnalysis();
        }
      }, 30000);
    }

    async performAutoAnalysis() {
      // console.log("Performing automatic context analysis...");

      const context = this.analyzeContext();

      // console.log("Auto-analysis result:", {
      //   confidence: context.confidence,
      //   category: context.category,
      //   keywords: context.keywords.length,
      //   shouldTrigger: this.shouldTriggerRecommendation(),
      // });

      if (this.shouldTriggerRecommendation()) {
        // console.log("Context is relevant! Triggering recommendation...");

        try {
          const response = await fetch("http://127.0.0.1:8000/recommend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context: context.context || `Page: ${document.title}`,
              keywords: context.keywords || [],
              category: context.category || null,
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const recommendation = await response.json();
          // console.log("Recommendation received:", recommendation);

          if (recommendation && recommendation.winner) {
            this.markRecommendationTriggered();

            chrome.storage.local.get(["history"], (result) => {
              let history = result.history || [];

              const entry = {
                quote:
                  recommendation.winner.quote.quote ||
                  recommendation.winner.quote.text,
                source: recommendation.winner.quote.source,
                context: `Recommandation automatique - ${document.title}`,
                timestamp: Date.now(),
                consensus: recommendation.consensus.quorum_percentage,
              };

              history.unshift(entry);
              if (history.length > 20) history = history.slice(0, 20);

              chrome.storage.local.set({ history: history });
            });

            chrome.storage.local.set({
              lastAutoRecommendation: {
                recommendation: recommendation,
                timestamp: Date.now(),
              },
            });

            this.showInPageNotification(recommendation);
          } else {
            // console.log("No consensus reached");
          }
        } catch (error) {
          console.error("Error getting recommendation:", error);
        }
      } else {
        console.log(
          "Context not relevant enough for recommendation (confidence: " +
            context.confidence +
            "%)"
        );
      }
    }

showInPageNotification(recommendation) {
  if (!recommendation || !recommendation.winner) return;

  let notifContainer = document.getElementById("PhiloNodes-notification");
  if (!notifContainer) {
    notifContainer = document.createElement("div");
    notifContainer.id = "PhiloNodes-notification";
    notifContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: linear-gradient(135deg, #fdfbf9 0%, #f9f6f2 100%);
      color: #5d4a3a;
      padding: 18px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(93, 74, 58, 0.15);
      z-index: 999999;
      font-family: Georgia, serif;
      border: 1px solid rgba(139, 115, 85, 0.2);
      animation: slideIn 0.4s ease;
    `;
    document.body.appendChild(notifContainer);
  }

  const quote =
    recommendation.winner.quote.quote || recommendation.winner.quote.text;
  const source = recommendation.winner.quote.source;
  const consensus = recommendation.consensus.quorum_percentage;

  chrome.storage.local.set({
    lastAutoRecommendation: {
      recommendation: recommendation,
      timestamp: Date.now(),
    },
  });

  notifContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
      <div style="font-size: 15px; font-weight: 600; color: #8b7355;">
        💭 PhiloNodes
      </div>
      <button id="close-notif-btn" 
              style="background: none; border: none; color: #a8916d; font-size: 22px; cursor: pointer; line-height: 1; transition: color 0.2s;">
        ×
      </button>
    </div>
    <div style="font-style: italic; line-height: 1.6; margin-bottom: 10px; font-size: 13px; color: #5d4a3a;">
      "${quote}"
    </div>
    <div style="text-align: right; font-size: 11px; color: #a08968; margin-bottom: 10px;">
      — ${source}
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <div style="font-size: 10px; background: rgba(197, 151, 110, 0.15); color: #8b7355; padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(197, 151, 110, 0.25);">
        Consensus ${consensus}%
      </div>
      <button id="open-popup-btn"
              style="background: linear-gradient(135deg, #c5976e 0%, #b89968 100%); 
                    color: #ffffff; border: none; padding: 6px 12px; border-radius: 8px; 
                    cursor: pointer; font-size: 11px; font-family: Georgia, serif; font-weight: 600;
                    box-shadow: 0 2px 6px rgba(139, 115, 85, 0.2); transition: all 0.2s;">
        Voir détails
      </button>
    </div>
  `;

  const closeBtn = document.getElementById("close-notif-btn");
  closeBtn.addEventListener("click", () => {
    notifContainer.style.display = "none";
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.color = "#8b7355";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.color = "#a8916d";
  });

  const openBtn = document.getElementById("open-popup-btn");
  openBtn.addEventListener("click", () => {
    chrome.storage.local.set(
      {
        pendingRecommendation: recommendation,
        timestamp: Date.now(),
      },
      () => {
        chrome.runtime.sendMessage({
          action: "openPopup",
        });
      }
    );
    notifContainer.style.display = "none";
  });
  openBtn.addEventListener("mouseenter", () => {
    openBtn.style.background = "linear-gradient(135deg, #d4a574 0%, #c5976e 100%)";
    openBtn.style.transform = "translateY(-1px)";
    openBtn.style.boxShadow = "0 3px 8px rgba(139, 115, 85, 0.25)";
  });
  openBtn.addEventListener("mouseleave", () => {
    openBtn.style.background = "linear-gradient(135deg, #c5976e 0%, #b89968 100%)";
    openBtn.style.transform = "translateY(0)";
    openBtn.style.boxShadow = "0 2px 6px rgba(139, 115, 85, 0.2)";
  });

  if (!document.getElementById("PhiloNodes-styles")) {
    const style = document.createElement("style");
    style.id = "PhiloNodes-styles";
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    if (notifContainer && notifContainer.style.display !== "none") {
      notifContainer.style.animation = "slideOut 0.4s ease";
      setTimeout(() => {
        notifContainer.style.display = "none";
      }, 400);
    }
  }, 15000);
}

    stopAutoAnalysis() {
      if (this.autoAnalysisInterval) {
        clearInterval(this.autoAnalysisInterval);
        this.autoAnalysisInterval = null;
        console.log("Auto-analysis stopped");
      }
    }

    initActivityTrackers() {
      document.addEventListener(
        "scroll",
        () => {
          const now = Date.now();
          if (now - this.lastScrollTime > 1000) {
            this.scrollCount = 0;
          }
          this.scrollCount++;
          this.lastScrollTime = now;

          if (this.scrollCount >= this.maxScrolls) {
            this.contextData.activityLevel = "high";
          } else if (this.scrollCount > 2) {
            this.contextData.activityLevel = "medium";
          } else {
            this.contextData.activityLevel = "low";
          }
        },
        { passive: true }
      );

      document.addEventListener("input", (e) => {
        const target = e.target;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          const now = Date.now();
          if (now - this.lastInputTime > 5000) {
            this.inputCount = 0;
          }
          this.inputCount++;
          this.lastInputTime = now;
        }
      });
    }

    normalize(text) {
      if (!text) return "";

      const cleaned = text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^\u0600-\u06FFa-z0-9\s\-']/gi, " ")
        .trim();

      return cleaned;
    }

    analyzeKeywords() {
      const bodyText = document.body.innerText || "";
      const normalizedText = this.normalize(bodyText);
      const words = normalizedText.split(/\s+/).filter((word) => word.length > 2);
      const wordsSet = new Set(words);

      const keywordCounts = {};
      const matchedKeywords = new Set();
      let totalMatches = 0;
      let strongestCategory = null;
      let maxMatches = 0;

      for (const category in this.emotionalKeywords) {
        keywordCounts[category] = 0;
      }

      for (const category in this.emotionalKeywords) {
        const categoryKeywords = this.emotionalKeywords[category];

        for (const keyword of categoryKeywords) {
          const normalizedKeyword = this.normalize(keyword);

          if (wordsSet.has(normalizedKeyword)) {
            keywordCounts[category] += 3;
            matchedKeywords.add(keyword);
            totalMatches += 3;
          } else if (
            normalizedKeyword.includes(" ") ||
            normalizedKeyword.includes("-")
          ) {
            if (normalizedText.includes(normalizedKeyword)) {
              keywordCounts[category] += 2;
              matchedKeywords.add(keyword);
              totalMatches += 2;
            }
          } else if (normalizedKeyword.length >= 4) {
            if (normalizedText.includes(normalizedKeyword)) {
              keywordCounts[category] += 1;
              matchedKeywords.add(keyword);
              totalMatches += 1;
            }
          }
        }

        if (keywordCounts[category] > maxMatches) {
          maxMatches = keywordCounts[category];
          strongestCategory = category;
        }
      }

      this.contextData.keywords = Array.from(matchedKeywords).slice(0, 15);
      this.contextData.emotionalTone = strongestCategory;
      this.contextData.categoryMatches = keywordCounts;
      this.contextData.totalMatches = totalMatches;
    }

    determineCategory() {
      const strongestTone = this.contextData.emotionalTone;
      if (strongestTone && this.categoryMapping[strongestTone]) {
        this.contextData.category = this.categoryMapping[strongestTone];
      } else if (!this.contextData.category) {
        this.contextData.category = null;
      }
    }

    determineConfidence() {
      const keywordMatches = this.contextData.totalMatches || 0;
      const bodyLength = document.body.innerText.length;
      const keywordCount = this.contextData.keywords.length;

      if (bodyLength === 0) {
        this.contextData.confidence = 0;
        return;
      }

      const density = (keywordMatches / bodyLength) * 1000;

      let confidence;
      if (density < 0.5) {
        confidence = density * 30;
      } else if (density >= 0.5 && density < 2) {
        confidence = 15 + ((density - 0.5) / 1.5) * 35;
      } else if (density >= 2 && density < 5) {
        confidence = 50 + ((density - 2) / 3) * 35;
      } else {
        confidence = 85 + ((density - 5) / 5) * 15;
        if (confidence > 100) confidence = 100;
      }

      const keywordBonus = Math.min(20, keywordCount * 2);
      confidence += keywordBonus;

      if (this.contextData.activityLevel === "medium") {
        confidence += 5;
      } else if (this.contextData.activityLevel === "high") {
        confidence += 10;
      }

      this.contextData.confidence = Math.min(100, Math.round(confidence));
    }

    analyzePageType() {
      const url = window.location.href.toLowerCase();
      let type = "general";

      if (url.includes("linkedin.com") || url.includes("indeed.com")) {
        type = "professional_social";
      } else if (
        url.includes("facebook.com") ||
        url.includes("twitter.com") ||
        url.includes("instagram.com") ||
        url.includes("reddit.com")
      ) {
        type = "personal_social";
      } else if (url.includes("google.com/search") || url.includes("bing.com")) {
        type = "search";
      } else if (url.includes("amazon.com") || url.includes("ebay.com")) {
        type = "e-commerce";
      } else if (url.includes("youtube.com") || url.includes("netflix.com")) {
        type = "entertainment";
      } else if (
        url.includes("mail.google.com") ||
        url.includes("outlook.live.com")
      ) {
        type = "email";
      }

      this.contextData.pageType = type;
    }

    analyzeContext() {
      this.analyzeKeywords();
      this.determineCategory();
      this.determineConfidence();
      this.analyzePageType();
      return this.contextData;
    }

    shouldTriggerRecommendation() {
      const now = Date.now();
      const isReady = now - this.lastTriggerTime >= this.triggerInterval;
      const isConfident = this.contextData.confidence >= 20;

      return isReady && isConfident;
    }

    markRecommendationTriggered() {
      this.lastTriggerTime = Date.now();
    }
  }

  const analyzer = new ContextAnalyzer();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getContext") {
      const context = analyzer.analyzeContext();
      sendResponse({ context });
    } else if (request.action === "analyze") {
      const context = analyzer.analyzeContext();
      sendResponse({ context });
    } else if (request.action === "stopAutoAnalysis") {
      analyzer.stopAutoAnalysis();
      sendResponse({ success: true });
    } else if (request.action === "startAutoAnalysis") {
      analyzer.startAutoAnalysis();
      sendResponse({ success: true });
    }
    return true;
  });

  window.addEventListener("beforeunload", () => {
    analyzer.stopAutoAnalysis();
  });

  // console.log("PhiloNodes content script loaded with AUTO-ANALYSIS enabled");

  function injectChatButton() {
    if (document.getElementById("PhiloNodes-chat-btn")) return;

    if (!document.getElementById("philo-extension-root")) {
      const meta = document.createElement("meta");
      meta.id = "philo-extension-root";
      meta.content = chrome.runtime.getURL("");
      document.head.appendChild(meta);
    }

    const btn = document.createElement("button");
    btn.id = "PhiloNodes-chat-btn";
    btn.className = "chat-floating-btn";
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;

    btn.onclick = async () => {
      if (!window.chatLoaded) {
        try {
          const response = await fetch(chrome.runtime.getURL("chat.html"));
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const chatWindow = doc.getElementById("PhiloNodes-chat-window");
          if (chatWindow) document.body.appendChild(chatWindow);

          const script = document.createElement("script");
          script.src = chrome.runtime.getURL("chat.js");
          script.onload = () => {
            window.chatLoaded = true;
            const chat = document.getElementById("PhiloNodes-chat-window");
            if (chat) chat.style.display = "flex";
          };
          document.body.appendChild(script);
        } catch (error) {
          console.error("Failed to load chat:", error);
        }
      } else {
        const chatWindow = document.getElementById("PhiloNodes-chat-window");
        if (chatWindow) {
          chatWindow.style.display =
            chatWindow.style.display === "none" ? "flex" : "none";
        }
      }
    };

    document.body.appendChild(btn);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectChatButton);
  } else {
    injectChatButton();
  }
