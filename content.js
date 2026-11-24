/* Content for the vertical slice (U01–U02 + ST01 + placement).
   Markup in German text:
     [Guten Morgen|guten_morgen]   multi-word chunk -> one lexicon entry
     {der|d.f.dat}                 article: d = definite, i = indefinite; gender m/f/n/pl; case nom/akk/dat
     {Das|dem}                     demonstrative "das" (this / that)
     {Frau|frau_titel}             word -> explicit lexicon id (optionally |feature text)
   Any other word is looked up in FORMS (exact case first, then lower-cased first letter). */
(function () {
  const LEX = {
    // chunks and expressions
    hallo: { de: "Hallo", pos: "expr", en: "hello", pt: "olá" },
    tschuess: { de: "Tschüss", pos: "expr", en: "bye (informal)", pt: "tchau" },
    auf_wiedersehen: { de: "Auf Wiedersehen", pos: "expr", en: "goodbye (formal)", pt: "até logo (formal)" },
    guten_morgen: { de: "Guten Morgen", pos: "expr", en: "good morning", pt: "bom dia", note: "Morgen is masculine (der Morgen), so the greeting is Guten Morgen." },
    guten_tag: { de: "Guten Tag", pos: "expr", en: "hello (formal, daytime)", pt: "bom dia / boa tarde (formal)" },
    guten_abend: { de: "Guten Abend", pos: "expr", en: "good evening (greeting)", pt: "boa noite (ao chegar)" },
    gute_nacht: { de: "Gute Nacht", pos: "expr", en: "good night (when leaving or going to bed)", pt: "boa noite (ao sair ou dormir)", note: "Nacht is feminine (die Nacht), so it is Gute, not Guten. To greet someone in the evening, say Guten Abend." },
    freut_mich: { de: "Freut mich", pos: "expr", en: "nice to meet you", pt: "prazer" },
    herzlich_willkommen: { de: "Herzlich willkommen", pos: "expr", en: "welcome", pt: "seja bem-vindo(a)" },
    noch_einmal: { de: "noch einmal", pos: "expr", en: "once more, again", pt: "mais uma vez" },
    ein_bisschen: { de: "ein bisschen", pos: "expr", en: "a little", pt: "um pouco" },
    danke: { de: "danke", pos: "expr", en: "thank you", pt: "obrigado / obrigada" },
    bitte: { de: "bitte", pos: "expr", en: "please", pt: "por favor" },
    entschuldigung: { de: "Entschuldigung", pos: "expr", en: "excuse me; sorry", pt: "com licença; desculpe" },
    ja: { de: "ja", pos: "expr", en: "yes", pt: "sim" },
    nein: { de: "nein", pos: "expr", en: "no", pt: "não (resposta)", note: "nein answers a question. To make a sentence negative, use nicht." },
    ah: { de: "ah", pos: "expr", en: "ah, oh", pt: "ah" },
    richtig: { de: "richtig", pos: "adj", en: "right, correct", pt: "certo, correto" },
    falsch: { de: "falsch", pos: "adj", en: "wrong, false", pt: "errado, falso" },

    // pronouns
    ich: { de: "ich", pos: "pron", en: "I", pt: "eu" },
    du: { de: "du", pos: "pron", en: "you (informal)", pt: "você (informal)", note: "du: friends, family, colleagues who offer it, people of your age in casual settings." },
    sie_formal: { de: "Sie", pos: "pron", en: "you (formal)", pt: "o senhor / a senhora (formal)", note: "Sie with a capital S is the formal you: strangers, offices, shops, older people. The verb takes the -en form: Sie heißen, Sie sprechen." },
    sie_she: { de: "sie", pos: "pron", en: "she", pt: "ela" },
    er: { de: "er", pos: "pron", en: "he", pt: "ele" },
    es: { de: "es", pos: "pron", en: "it", pt: "isso (sujeito)", note: "Es ist Morgen = It is morning." },
    mein: { de: "mein", pos: "pron", en: "my", pt: "meu / minha", note: "mein with der/das words (mein Name), meine with die words (meine Wohnung)." },
    das_dem: { de: "das", pos: "pron", en: "this, that (pointing)", pt: "isto, isso", note: "Das ist … = This is … It does not change with gender: Das ist Ana. Das ist das Haus." },

    // verbs
    sein: { de: "sein", pos: "verb", en: "to be", pt: "ser / estar", conj: "ich bin · du bist · er/sie ist · wir/Sie sind" },
    heissen: { de: "heißen", pos: "verb", en: "to be called", pt: "chamar-se", conj: "ich heiße · du heißt · er/sie heißt · Sie heißen" },
    kommen: { de: "kommen", pos: "verb", en: "to come", pt: "vir", conj: "ich komme · du kommst · er/sie kommt · Sie kommen", note: "kommen aus + country/city = to come from." },
    wohnen: { de: "wohnen", pos: "verb", en: "to live (reside)", pt: "morar", conj: "ich wohne · du wohnst · er/sie wohnt · Sie wohnen", note: "wohnen in + city/country." },
    sprechen: { de: "sprechen", pos: "verb", en: "to speak", pt: "falar", conj: "ich spreche · du sprichst · er/sie spricht · Sie sprechen", note: "The vowel changes in the du and er/sie forms: e → i." },
    verstehen: { de: "verstehen", pos: "verb", en: "to understand", pt: "entender", conj: "ich verstehe · du verstehst · er/sie versteht · Sie verstehen" },
    lernen: { de: "lernen", pos: "verb", en: "to learn", pt: "aprender", conj: "ich lerne · du lernst · er/sie lernt · Sie lernen" },
    koennen: { de: "können", pos: "verb", en: "can, to be able to", pt: "poder", conj: "ich kann · du kannst · er/sie kann · Sie können", note: "Könnten Sie …? = Could you …? It is the polite form. Learn it as a block for now." },
    brauchen: { de: "brauchen", pos: "verb", en: "to need", pt: "precisar", conj: "ich brauche · du brauchst · er/sie braucht · Sie brauchen" },
    sehen: { de: "sehen", pos: "verb", en: "to see", pt: "ver", conj: "ich sehe · du siehst · er/sie sieht · Sie sehen" },
    besuchen: { de: "besuchen", pos: "verb", en: "to visit", pt: "visitar", conj: "ich besuche · du besuchst · er/sie besucht · Sie besuchen" },
    sagen: { de: "sagen", pos: "verb", en: "to say", pt: "dizer", conj: "ich sage · du sagst · er/sie sagt · Sie sagen" },
    fragen: { de: "fragen", pos: "verb", en: "to ask", pt: "perguntar", conj: "ich frage · du fragst · er/sie fragt · Sie fragen" },

    // question words
    wie: { de: "wie", pos: "qword", en: "how; what (name)", pt: "como", note: "Wie heißt du? = What is your name? (literally: how are you called?)" },
    woher: { de: "woher", pos: "qword", en: "where from", pt: "de onde" },
    wo: { de: "wo", pos: "qword", en: "where", pt: "onde" },
    was: { de: "was", pos: "qword", en: "what", pt: "o que" },
    wer: { de: "wer", pos: "qword", en: "who", pt: "quem" },
    welcher: { de: "welcher", pos: "qword", en: "which", pt: "qual / quais", note: "welche before plural nouns: Welche Sprachen …?" },

    // small words
    aus: { de: "aus", pos: "prep", en: "from (origin)", pt: "de (origem)" },
    in: { de: "in", pos: "prep", en: "in", pt: "em" },
    an: { de: "an", pos: "prep", en: "at, on", pt: "em, junto a" },
    mit: { de: "mit", pos: "prep", en: "with", pt: "com" },
    von: { de: "von", pos: "prep", en: "of, from", pt: "de" },
    und: { de: "und", pos: "conj", en: "and", pt: "e" },
    aber: { de: "aber", pos: "conj", en: "but", pt: "mas" },
    auch: { de: "auch", pos: "adv", en: "also, too", pt: "também" },
    nicht: { de: "nicht", pos: "adv", en: "not", pt: "não", note: "nicht makes a sentence negative: Ich verstehe nicht. For a yes/no answer use nein." },
    hier: { de: "hier", pos: "adv", en: "here", pt: "aqui" },
    jetzt: { de: "jetzt", pos: "adv", en: "now", pt: "agora" },
    schon: { de: "schon", pos: "adv", en: "already", pt: "já" },
    nur: { de: "nur", pos: "adv", en: "only", pt: "só, apenas" },
    sehr: { de: "sehr", pos: "adv", en: "very", pt: "muito" },
    neu: { de: "neu", pos: "adj", en: "new", pt: "novo / nova" },
    gut: { de: "gut", pos: "adj", en: "good, well", pt: "bom; bem" },
    toll: { de: "toll", pos: "adj", en: "great", pt: "ótimo, legal" },
    langsam: { de: "langsam", pos: "adj", en: "slow", pt: "devagar, lento" },
    schnell: { de: "schnell", pos: "adj", en: "fast", pt: "rápido" },

    // articles
    der_art: { de: "der / die / das", pos: "art", en: "the", pt: "o / a" },
    ein_art: { de: "ein / eine", pos: "art", en: "a, an", pt: "um / uma" },

    // nouns
    morgen: { de: "Morgen", pos: "noun", art: "der", pl: "Morgen", en: "morning", pt: "manhã", img: "sky_morning" },
    tag: { de: "Tag", pos: "noun", art: "der", pl: "Tage", en: "day", pt: "dia", img: "sky_day" },
    abend: { de: "Abend", pos: "noun", art: "der", pl: "Abende", en: "evening", pt: "noite (início), fim de tarde", img: "sky_evening" },
    nacht: { de: "Nacht", pos: "noun", art: "die", pl: "Nächte", en: "night", pt: "noite", img: "sky_night" },
    name: { de: "Name", pos: "noun", art: "der", pl: "Namen", en: "name", pt: "nome", img: "nametag" },
    mann: { de: "Mann", pos: "noun", art: "der", pl: "Männer", en: "man", pt: "homem", img: "paul" },
    frau: { de: "Frau", pos: "noun", art: "die", pl: "Frauen", en: "woman", pt: "mulher", img: "ana", note: "Frau + surname = Mrs / Ms: Frau Weber." },
    frau_titel: { de: "Frau", pos: "title", en: "Mrs / Ms (before a surname)", pt: "senhora (antes do sobrenome)", note: "Frau Weber, Frau Silva. For men: Herr Keller." },
    land: { de: "Land", pos: "noun", art: "das", pl: "Länder", en: "country", pt: "país", img: "land" },
    stadt: { de: "Stadt", pos: "noun", art: "die", pl: "Städte", en: "city, town", pt: "cidade", img: "stadt" },
    haus: { de: "Haus", pos: "noun", art: "das", pl: "Häuser", en: "house; building", pt: "casa; prédio", img: "haus" },
    tuer: { de: "Tür", pos: "noun", art: "die", pl: "Türen", en: "door", pt: "porta", img: "tuer" },
    wohnung: { de: "Wohnung", pos: "noun", art: "die", pl: "Wohnungen", en: "apartment, flat", pt: "apartamento", img: "wohnung", note: "Words ending in -ung are always die." },
    nachbar: { de: "Nachbar", pos: "noun", art: "der", pl: "Nachbarn", en: "neighbour (man)", pt: "vizinho", img: "nachbar" },
    nachbarin: { de: "Nachbarin", pos: "noun", art: "die", pl: "Nachbarinnen", en: "neighbour (woman)", pt: "vizinha", img: "nachbarin", note: "-in makes the female form, and it is always die: der Nachbar → die Nachbarin." },
    sprache: { de: "Sprache", pos: "noun", art: "die", pl: "Sprachen", en: "language", pt: "língua, idioma", img: "sprache" },
    formular: { de: "Formular", pos: "noun", art: "das", pl: "Formulare", en: "form (document)", pt: "formulário" },
    kopie: { de: "Kopie", pos: "noun", art: "die", pl: "Kopien", en: "copy", pt: "cópia" },
    pass: { de: "Pass", pos: "noun", art: "der", pl: "Pässe", en: "passport", pt: "passaporte" },

    // names, places, languages
    ana: { de: "Ana", pos: "name", en: "Ana (first name)", pt: "Ana (nome)" },
    paul: { de: "Paul", pos: "name", en: "Paul (first name)", pt: "Paul (nome)" },
    weber: { de: "Weber", pos: "name", en: "Weber (surname)", pt: "Weber (sobrenome)" },
    silva: { de: "Silva", pos: "name", en: "Silva (surname)", pt: "Silva (sobrenome)" },
    zuerich: { de: "Zürich", pos: "name", en: "Zurich (city)", pt: "Zurique (cidade)" },
    berlin: { de: "Berlin", pos: "name", en: "Berlin (city)", pt: "Berlim (cidade)" },
    brasilien: { de: "Brasilien", pos: "name", en: "Brazil", pt: "Brasil", img: "flag_br" },
    deutschland: { de: "Deutschland", pos: "name", en: "Germany", pt: "Alemanha", img: "flag_de" },
    portugal: { de: "Portugal", pos: "name", en: "Portugal", pt: "Portugal", img: "flag_pt" },
    schweiz: { de: "die Schweiz", pos: "name", en: "Switzerland", pt: "Suíça", img: "flag_ch", note: "Most countries have no article (Brasilien, Deutschland). A few do: die Schweiz → in der Schweiz." },
    deutsch: { de: "Deutsch", pos: "name", en: "German (language)", pt: "alemão (língua)" },
    englisch: { de: "Englisch", pos: "name", en: "English (language)", pt: "inglês (língua)" },
    portugiesisch: { de: "Portugiesisch", pos: "name", en: "Portuguese (language)", pt: "português (língua)" }
  };

  // surface form -> [lexId, feature]
  const F = (lex, feat) => [lex, feat || ""];
  const FORMS = {
    Hallo: F("hallo"), "Tschüss": F("tschuess"), danke: F("danke"), bitte: F("bitte"), Entschuldigung: F("entschuldigung"),
    ja: F("ja"), nein: F("nein"), ah: F("ah"), richtig: F("richtig"), falsch: F("falsch"),
    ich: F("ich"), du: F("du"), Sie: F("sie_formal", "formal you"), sie: F("sie_she"), er: F("er"), es: F("es"),
    mein: F("mein", "my (with a der/das word)"), meine: F("mein", "my (with a die word or plural)"),
    bin: F("sein", "ich form: am"), bist: F("sein", "du form: are"), ist: F("sein", "er/sie/es form: is"), sind: F("sein", "wir/Sie form: are"),
    "heiße": F("heissen", "ich form"), "heißt": F("heissen", "du or er/sie form"), "heißen": F("heissen", "Sie/wir form"),
    komme: F("kommen", "ich form"), kommst: F("kommen", "du form"), kommt: F("kommen", "er/sie form"),
    wohne: F("wohnen", "ich form"), wohnst: F("wohnen", "du form"), wohnt: F("wohnen", "er/sie form"),
    spreche: F("sprechen", "ich form"), sprichst: F("sprechen", "du form (e → i)"), spricht: F("sprechen", "er/sie form (e → i)"), sprechen: F("sprechen", "Sie/wir form, or infinitive"),
    verstehe: F("verstehen", "ich form"), versteht: F("verstehen", "er/sie form"),
    lerne: F("lernen", "ich form"), brauchen: F("brauchen", "Sie/wir form"),
    "könnten": F("koennen", "polite form: could"), sieht: F("sehen", "er/sie form (e → ie)"), besucht: F("besuchen", "er/sie form"),
    sagt: F("sagen", "er/sie form"), fragt: F("fragen", "er/sie form"),
    wie: F("wie"), woher: F("woher"), wo: F("wo"), was: F("was"), wer: F("wer"), welche: F("welcher", "plural form"),
    aus: F("aus"), in: F("in"), mit: F("mit"), von: F("von"),
    vom: F("von", "von + dem: from the (dative, masculine/neuter)"),
    am: F("an", "an + dem: on the; am Abend = in the evening"),
    im: F("in", "in + dem: in the (dative, masculine/neuter)"),
    und: F("und"), aber: F("aber"), auch: F("auch"), nicht: F("nicht"), hier: F("hier"), jetzt: F("jetzt"), schon: F("schon"), nur: F("nur"), sehr: F("sehr"),
    neu: F("neu"), gut: F("gut"), toll: F("toll"), langsamer: F("langsam", "comparative: slower"), schnell: F("schnell"),
    Morgen: F("morgen"), Tag: F("tag"), Abend: F("abend"), Nacht: F("nacht"), Name: F("name"), Mann: F("mann"), Frau: F("frau"),
    Land: F("land"), Stadt: F("stadt"), Haus: F("haus"), "Tür": F("tuer"), Wohnung: F("wohnung"), Nachbar: F("nachbar"), Nachbarin: F("nachbarin"),
    Sprache: F("sprache"), Sprachen: F("sprache", "plural: die Sprachen"), Formular: F("formular"), Kopie: F("kopie"), Pass: F("pass"),
    Ana: F("ana"), Paul: F("paul"), Weber: F("weber"), Silva: F("silva"), "Zürich": F("zuerich"), Berlin: F("berlin"),
    Brasilien: F("brasilien"), Deutschland: F("deutschland"), Portugal: F("portugal"), Schweiz: F("schweiz"),
    Deutsch: F("deutsch"), Englisch: F("englisch"), Portugiesisch: F("portugiesisch")
  };

  // speaker: ana | paul | weber | clerk | nar
  const S = (sp, de, en, pt) => ({ sp, de, en, pt });
  const SENT = {
    // L01
    s0101: S("nar", "Es ist Morgen.", "It is morning.", "É de manhã."),
    s0102: S("ana", "[Guten Morgen|guten_morgen], Paul!", "Good morning, Paul!", "Bom dia, Paul!"),
    s0103: S("paul", "[Guten Morgen|guten_morgen], Ana!", "Good morning, Ana!", "Bom dia, Ana!"),
    s0104: S("nar", "Es ist Tag.", "It is daytime.", "É dia."),
    s0105: S("ana", "[Guten Tag|guten_tag], {Frau|frau_titel} Weber!", "Hello, Mrs Weber!", "Bom dia, senhora Weber!"),
    s0106: S("weber", "[Guten Tag|guten_tag], Ana!", "Hello, Ana!", "Bom dia, Ana!"),
    s0107: S("nar", "Es ist Abend.", "It is evening.", "É noite (começo da noite)."),
    s0108: S("ana", "[Guten Abend|guten_abend], Paul!", "Good evening, Paul!", "Boa noite, Paul!"),
    s0109: S("nar", "Es ist Nacht.", "It is night.", "É noite."),
    s0110: S("paul", "[Gute Nacht|gute_nacht], Ana!", "Good night, Ana!", "Boa noite, Ana!"),
    s0111: S("ana", "[Gute Nacht|gute_nacht]!", "Good night!", "Boa noite!"),
    s0120: S("nar", "Was sagt Ana?", "What does Ana say?", "O que a Ana diz?"),
    // L02
    s0201: S("paul", "Hallo! Ich bin Paul.", "Hi! I'm Paul.", "Oi! Eu sou o Paul."),
    s0202: S("paul", "Wie {heißt|heissen|du form} du?", "What's your name?", "Como você se chama?"),
    s0203: S("ana", "Ich heiße Ana.", "My name is Ana.", "Eu me chamo Ana."),
    s0204: S("paul", "[Freut mich|freut_mich], Ana!", "Nice to meet you, Ana!", "Prazer, Ana!"),
    s0205: S("ana", "[Freut mich|freut_mich] auch!", "Nice to meet you too!", "O prazer é meu!"),
    s0206: S("weber", "[Guten Tag|guten_tag]. Wie heißen Sie?", "Hello. What is your name?", "Bom dia. Como a senhora se chama?"),
    s0207: S("ana", "Mein Name ist Ana Silva.", "My name is Ana Silva.", "Meu nome é Ana Silva."),
    s0208: S("weber", "[Freut mich|freut_mich], {Frau|frau_titel} Silva.", "Nice to meet you, Ms Silva.", "Prazer, senhora Silva."),
    s0209: S("nar", "Paul ist {ein|i.m.nom} Mann.", "Paul is a man.", "Paul é um homem."),
    s0210: S("nar", "Ana ist {eine|i.f.nom} Frau.", "Ana is a woman.", "Ana é uma mulher."),
    s0211: S("weber", "Wie ist {der|d.m.nom} Name, bitte?", "What is the name, please?", "Qual é o nome, por favor?"),
    s0212: S("paul", "Tschüss, Ana!", "Bye, Ana!", "Tchau, Ana!"),
    s0213: S("weber", "[Auf Wiedersehen|auf_wiedersehen], {Frau|frau_titel} Silva!", "Goodbye, Ms Silva!", "Até logo, senhora Silva!"),
    s0214: S("ana", "[Auf Wiedersehen|auf_wiedersehen]!", "Goodbye!", "Até logo!"),
    s0220: S("nar", "Ana spricht mit {Frau|frau_titel} Weber. Was sagt Ana?", "Ana is talking to Mrs Weber. What does Ana say?", "Ana fala com a senhora Weber. O que a Ana diz?"),
    // L03
    s0301: S("paul", "Woher kommst du, Ana?", "Where are you from, Ana?", "De onde você é, Ana?"),
    s0302: S("ana", "Ich komme aus Brasilien.", "I'm from Brazil.", "Eu sou do Brasil."),
    s0303: S("paul", "Aus Brasilien? Toll!", "From Brazil? Great!", "Do Brasil? Que legal!"),
    s0304: S("ana", "Und du? Woher kommst du?", "And you? Where are you from?", "E você? De onde você é?"),
    s0305: S("paul", "Ich komme aus Deutschland, aus Berlin.", "I'm from Germany, from Berlin.", "Eu sou da Alemanha, de Berlim."),
    s0306: S("ana", "Und wo wohnst du jetzt?", "And where do you live now?", "E onde você mora agora?"),
    s0307: S("paul", "Ich wohne hier in Zürich.", "I live here in Zurich.", "Eu moro aqui em Zurique."),
    s0308: S("ana", "Ich wohne auch in Zürich, in {der|d.f.dat} Schweiz.", "I live in Zurich too, in Switzerland.", "Eu também moro em Zurique, na Suíça."),
    s0309: S("nar", "Brasilien ist {ein|i.n.nom} Land.", "Brazil is a country.", "O Brasil é um país."),
    s0310: S("nar", "Berlin ist {eine|i.f.nom} Stadt.", "Berlin is a city.", "Berlim é uma cidade."),
    s0311: S("nar", "Deutschland ist auch {ein|i.n.nom} Land.", "Germany is also a country.", "A Alemanha também é um país."),
    s0312: S("nar", "Zürich ist {eine|i.f.nom} Stadt in {der|d.f.dat} Schweiz.", "Zurich is a city in Switzerland.", "Zurique é uma cidade na Suíça."),
    s0313: S("nar", "Woher kommt Ana?", "Where is Ana from?", "De onde a Ana é?"),
    // L04
    s0401: S("nar", "{Das|das_dem} ist {das|d.n.nom} Haus.", "This is the building.", "Este é o prédio."),
    s0402: S("nar", "Hier ist {die|d.f.nom} Tür.", "Here is the door.", "Aqui está a porta."),
    s0403: S("nar", "{Das|das_dem} ist {die|d.f.nom} Wohnung von Ana.", "This is Ana's apartment.", "Este é o apartamento da Ana."),
    s0404: S("nar", "Paul ist {der|d.m.nom} Nachbar.", "Paul is the neighbour.", "Paul é o vizinho."),
    s0405: S("nar", "{Frau|frau_titel} Weber ist {die|d.f.nom} Nachbarin.", "Mrs Weber is the neighbour.", "A senhora Weber é a vizinha."),
    s0406: S("ana", "[Guten Tag|guten_tag]! Ich bin Ana. Ich bin neu hier.", "Hello! I'm Ana. I'm new here.", "Bom dia! Eu sou a Ana. Sou nova aqui."),
    s0407: S("weber", "[Guten Tag|guten_tag]! Ich bin {Frau|frau_titel} Weber. [Herzlich willkommen|herzlich_willkommen]!", "Hello! I'm Mrs Weber. Welcome!", "Bom dia! Eu sou a senhora Weber. Seja bem-vinda!"),
    s0408: S("ana", "Danke!", "Thank you!", "Obrigada!"),
    s0409: S("nar", "{Die|d.f.nom} Wohnung ist neu.", "The apartment is new.", "O apartamento é novo."),
    s0410: S("ana", "Wo ist {die|d.f.nom} Tür?", "Where is the door?", "Onde fica a porta?"),
    s0411: S("nar", "{Das|d.n.nom} Haus ist neu.", "The building is new.", "O prédio é novo."),
    s0412: S("nar", "Ana ist neu. Was sagt sie?", "Ana is new. What does she say?", "A Ana é nova. O que ela diz?"),
    // L05
    s0501: S("paul", "Welche Sprachen sprichst du?", "Which languages do you speak?", "Que línguas você fala?"),
    s0502: S("ana", "Ich spreche Portugiesisch und Englisch.", "I speak Portuguese and English.", "Eu falo português e inglês."),
    s0503: S("ana", "Und ich lerne Deutsch.", "And I'm learning German.", "E estou aprendendo alemão."),
    s0504: S("paul", "Du sprichst schon gut Deutsch!", "You already speak good German!", "Você já fala bem alemão!"),
    s0505: S("ana", "Danke! Aber nur [ein bisschen|ein_bisschen].", "Thanks! But only a little.", "Obrigada! Mas só um pouco."),
    s0506: S("nar", "Paul spricht Deutsch und Englisch.", "Paul speaks German and English.", "Paul fala alemão e inglês."),
    s0507: S("nar", "Deutsch ist {eine|i.f.nom} Sprache.", "German is a language.", "Alemão é uma língua."),
    s0508: S("ana", "Entschuldigung, sprechen Sie Englisch?", "Excuse me, do you speak English?", "Com licença, o senhor fala inglês?"),
    s0509: S("clerk", "Ja, [ein bisschen|ein_bisschen].", "Yes, a little.", "Sim, um pouco."),
    s0510: S("ana", "Ich spreche Englisch.", "I speak English.", "Eu falo inglês."),
    s0511: S("ana", "Ich spreche Deutsch.", "I speak German.", "Eu falo alemão."),
    s0512: S("ana", "Ich lerne Deutsch.", "I'm learning German.", "Estou aprendendo alemão."),
    // L06
    s0601: S("clerk", "Sie brauchen {das|d.n.akk} Formular und {eine|i.f.akk} Kopie vom Pass.", "You need the form and a copy of the passport.", "O senhor precisa do formulário e de uma cópia do passaporte."),
    s0602: S("ana", "Entschuldigung, ich verstehe nicht.", "Sorry, I don't understand.", "Desculpe, não entendi."),
    s0603: S("ana", "{Könnten|koennen|polite form: could} Sie bitte langsamer sprechen?", "Could you speak more slowly, please?", "O senhor poderia falar mais devagar, por favor?"),
    s0605: S("ana", "[Noch einmal|noch_einmal], bitte.", "Once more, please.", "Mais uma vez, por favor."),
    s0606: S("ana", "Ah, jetzt verstehe ich. Danke!", "Ah, now I understand. Thanks!", "Ah, agora entendi. Obrigada!"),
    s0607: S("nar", "Ana versteht nicht. Was sagt sie?", "Ana doesn't understand. What does she say?", "A Ana não entende. O que ela diz?"),
    s0608: S("nar", "{Der|d.m.nom} Mann spricht sehr schnell. Was sagt Ana?", "The man speaks very fast. What does Ana say?", "O homem fala muito rápido. O que a Ana diz?"),
    s0609: S("ana", "Nein, danke.", "No, thank you.", "Não, obrigada."),
    s0610: S("ana", "Ich verstehe nicht.", "I don't understand.", "Não entendo."),
    // ST01
    t0101: S("nar", "{Das|das_dem} ist Ana.", "This is Ana.", "Esta é a Ana."),
    t0102: S("nar", "Ana kommt aus Brasilien.", "Ana is from Brazil.", "A Ana é do Brasil."),
    t0103: S("nar", "{Sie|sie_she} wohnt jetzt in Zürich.", "She lives in Zurich now.", "Ela mora em Zurique agora."),
    t0104: S("nar", "{Die|d.f.nom} Wohnung ist neu.", "The apartment is new.", "O apartamento é novo."),
    t0105: S("nar", "Es ist Morgen.", "It is morning.", "É de manhã."),
    t0106: S("nar", "Ana sieht {einen|i.m.akk} Mann.", "Ana sees a man.", "A Ana vê um homem."),
    t0107: S("nar", "Er {heißt|heissen|er/sie form} Paul.", "His name is Paul.", "Ele se chama Paul."),
    t0108: S("nar", "Paul ist {der|d.m.nom} Nachbar.", "Paul is the neighbour.", "Paul é o vizinho."),
    t0109: S("paul", "[Guten Morgen|guten_morgen]! Bist du neu hier?", "Good morning! Are you new here?", "Bom dia! Você é nova aqui?"),
    t0110: S("ana", "Ja, ich bin neu hier. Ich heiße Ana.", "Yes, I'm new here. My name is Ana.", "Sim, sou nova aqui. Eu me chamo Ana."),
    t0111: S("paul", "[Freut mich|freut_mich], Ana! Woher kommst du?", "Nice to meet you, Ana! Where are you from?", "Prazer, Ana! De onde você é?"),
    t0112: S("ana", "Ich komme aus Brasilien. Und du?", "I'm from Brazil. And you?", "Eu sou do Brasil. E você?"),
    t0113: S("paul", "Ich komme aus Deutschland.", "I'm from Germany.", "Eu sou da Alemanha."),
    t0114: S("nar", "Am Abend besucht Ana {Frau|frau_titel} Weber.", "In the evening, Ana visits Mrs Weber.", "À noite, a Ana visita a senhora Weber."),
    t0115: S("weber", "[Guten Abend|guten_abend]! [Herzlich willkommen|herzlich_willkommen] im Haus!", "Good evening! Welcome to the building!", "Boa noite! Bem-vinda ao prédio!"),
    t0116: S("ana", "Danke, {Frau|frau_titel} Weber! [Gute Nacht|gute_nacht]!", "Thank you, Mrs Weber! Good night!", "Obrigada, senhora Weber! Boa noite!"),
    t0117: S("weber", "[Gute Nacht|gute_nacht], Ana!", "Good night, Ana!", "Boa noite, Ana!"),
    t0120: S("nar", "Wer ist Paul?", "Who is Paul?", "Quem é o Paul?"),
    t0121: S("nar", "Ana wohnt in Berlin.", "Ana lives in Berlin.", "A Ana mora em Berlim."),
    t0122: S("nar", "Paul kommt aus Deutschland.", "Paul is from Germany.", "Paul é da Alemanha."),
    t0123: S("nar", "Ana sieht Paul.", "Ana sees Paul.", "A Ana vê o Paul."),
    t0124: S("nar", "Paul fragt: Woher kommst du?", "Paul asks: Where are you from?", "Paul pergunta: De onde você é?"),
    t0125: S("nar", "Ana besucht {Frau|frau_titel} Weber.", "Ana visits Mrs Weber.", "A Ana visita a senhora Weber."),
    // extra example sentences (word lens "another example")
    x001: S("nar", "Hallo, Ana!", "Hi, Ana!", "Oi, Ana!"),
    x002: S("ana", "Tschüss, Paul! Bis bald.", "Bye, Paul! See you soon.", "Tchau, Paul! Até logo."),
    x003: S("nar", "{Der|d.m.nom} Morgen ist schön.", "The morning is lovely.", "A manhã está bonita."),
    x004: S("nar", "{Der|d.m.nom} Tag ist lang.", "The day is long.", "O dia é longo."),
    x005: S("nar", "{Der|d.m.nom} Abend ist schön.", "The evening is lovely.", "A noite está bonita."),
    x006: S("nar", "{Die|d.f.nom} Nacht ist lang.", "The night is long.", "A noite é longa."),
    x007: S("nar", "{Der|d.m.nom} Mann heißt Paul.", "The man's name is Paul.", "O homem se chama Paul."),
    x008: S("nar", "{Die|d.f.nom} Frau heißt Ana.", "The woman's name is Ana.", "A mulher se chama Ana."),
    x009: S("nar", "Portugal ist {ein|i.n.nom} Land.", "Portugal is a country.", "Portugal é um país."),
    x010: S("nar", "{Die|d.f.nom} Stadt ist neu.", "The town is new.", "A cidade é nova."),
    x011: S("nar", "{Die|d.f.nom} Tür ist neu.", "The door is new.", "A porta é nova."),
    x012: S("nar", "Wo wohnt {der|d.m.nom} Nachbar?", "Where does the neighbour live?", "Onde mora o vizinho?"),
    x013: S("nar", "{Die|d.f.nom} Nachbarin kommt aus Berlin.", "The neighbour comes from Berlin.", "A vizinha é de Berlim."),
    x014: S("nar", "Englisch ist auch {eine|i.f.nom} Sprache.", "English is also a language.", "Inglês também é uma língua."),
    x015: S("ana", "Ich lerne jetzt Deutsch.", "I'm learning German now.", "Estou aprendendo alemão agora."),
    x016: S("paul", "Verstehst du?", "Do you understand?", "Você entende?"),
    x017: S("ana", "Ja, danke. Ich verstehe.", "Yes, thanks. I understand.", "Sim, obrigada. Entendo."),
    x018: S("ana", "Mein Name ist Ana.", "My name is Ana.", "Meu nome é Ana."),
    x019: S("nar", "Paul wohnt hier.", "Paul lives here.", "Paul mora aqui."),
    x020: S("ana", "Bitte langsam!", "Slowly, please!", "Devagar, por favor!"),
    x021: S("weber", "Wo wohnen Sie?", "Where do you live?", "Onde a senhora mora?"),
    x022: S("paul", "Wer ist das?", "Who is that?", "Quem é?"),
    x023: S("nar", "Paul ist sehr nett.", "Paul is very nice.", "Paul é muito simpático."),
    x024: S("ana", "{Könnten|koennen|polite form: could} Sie das bitte [noch einmal|noch_einmal] sagen?", "Could you say that again, please?", "O senhor poderia repetir, por favor?"),
    x025: S("nar", "Paul spricht langsam.", "Paul speaks slowly.", "Paul fala devagar."),
    x026: S("nar", "Ana spricht Portugiesisch.", "Ana speaks Portuguese.", "A Ana fala português."),
    x027: S("paul", "Ich spreche Englisch, aber nicht Portugiesisch.", "I speak English, but not Portuguese.", "Eu falo inglês, mas não português.")
  };
  // a few extra forms used only in example sentences
  Object.assign(FORMS, {
    bis: F("bis_bald_bis", ""), bald: F("bald"), "schön": F("schoen"), lang: F("lang_adj"), nett: F("nett"),
    Verstehst: F("verstehen", "du form"), verstehst: F("verstehen", "du form"), wohnen: F("wohnen", "Sie/wir form"),
    das: F("das_dem"), langsam: F("langsam"), sagen: F("sagen", "infinitive")
  });
  Object.assign(LEX, {
    bis_bald_bis: { de: "bis", pos: "prep", en: "until; see you (bis bald)", pt: "até" },
    bald: { de: "bald", pos: "adv", en: "soon", pt: "em breve" },
    schoen: { de: "schön", pos: "adj", en: "beautiful, nice", pt: "bonito, lindo" },
    lang_adj: { de: "lang", pos: "adj", en: "long", pt: "longo, comprido" },
    nett: { de: "nett", pos: "adj", en: "nice, kind", pt: "simpático, gentil" }
  });

  // Lesson steps:
  //   intro  {lex, s:[sentence ids]}                    new word card (image + article + audio)
  //   scene  {art, lines:[sentence ids]}                narrated scene / dialogue
  //   note   {en, pt}                                   short optional grammar tip
  //   q      {type, ...}                                question
  //     pick_art      {audio: sid|markup, opts:[art ids], a}
  //     choose        {art?, prompt: sid, opts:[markup], a, audio?:bool}
  //     article       {lex}
  //     order         {sid, alt?:[strings]}
  //     listen_choose {audio: sid, opts:[markup], a}
  //     tf            {art?, prompt: sid, a: true|false}
  const LESSONS = [
    {
      id: "L01", unit: "U01", title: "Hallo!", sub: "Greetings through the day",
      newLex: ["morgen", "guten_morgen", "tag", "guten_tag", "abend", "guten_abend", "nacht", "gute_nacht"],
      steps: [
        { t: "intro", lex: "morgen", s: ["s0101", "s0102", "s0103"] },
        { t: "intro", lex: "tag", s: ["s0104", "s0105", "s0106"] },
        { t: "intro", lex: "abend", s: ["s0107", "s0108"] },
        { t: "intro", lex: "nacht", s: ["s0109", "s0110", "s0111"] },
        { t: "note", en: "Guten Morgen, Guten Tag, Guten Abend: all three nouns are der words (masculine). Gute Nacht: Nacht is a die word (feminine), so the ending changes. You will see this pattern again with adjectives.", pt: "Guten Morgen, Guten Tag, Guten Abend: os três substantivos são der (masculinos). Gute Nacht: Nacht é die (feminino), por isso a terminação muda." },
        { t: "q", type: "pick_art", audio: "[Guten Abend|guten_abend]!", opts: ["sky_morning", "sky_day", "sky_evening", "sky_night"], a: 2 },
        { t: "q", type: "choose", art: "sky_night", prompt: "s0120", opts: ["[Gute Nacht|gute_nacht]!", "[Guten Morgen|guten_morgen]!", "[Guten Tag|guten_tag]!"], a: 0 },
        { t: "q", type: "article", lex: "nacht" },
        { t: "q", type: "article", lex: "morgen" },
        { t: "q", type: "choose", art: "sky_morning", prompt: "s0120", opts: ["[Guten Abend|guten_abend]!", "[Guten Morgen|guten_morgen]!", "[Gute Nacht|gute_nacht]!"], a: 1 }
      ]
    },
    {
      id: "L02", unit: "U01", title: "Ich heiße Ana", sub: "Names, du and Sie",
      newLex: ["hallo", "ich", "heissen", "sein", "du", "wie", "freut_mich", "sie_formal", "mein", "name", "mann", "frau", "tschuess", "auf_wiedersehen"],
      steps: [
        { t: "scene", art: "meet", lines: ["s0201", "s0202", "s0203", "s0204", "s0205", "s0212"] },
        { t: "intro", lex: "mann", s: ["s0209"] },
        { t: "intro", lex: "frau", s: ["s0210"] },
        { t: "scene", art: "formal", lines: ["s0206", "s0207", "s0208", "s0213", "s0214"] },
        { t: "intro", lex: "name", s: ["s0207", "s0211"] },
        { t: "note", en: "du is informal (friends, colleagues who offer it). Sie with a capital S is formal (strangers, offices, older people). Three ways to give your name: Ich heiße Ana. · Ich bin Ana. · Mein Name ist Ana. Informal goodbye: Tschüss. Formal: Auf Wiedersehen.", pt: "du é informal (amigos, colegas que oferecem). Sie, com S maiúsculo, é formal (desconhecidos, repartições, pessoas mais velhas). Três jeitos de dizer o nome: Ich heiße Ana. · Ich bin Ana. · Mein Name ist Ana. Tchau informal: Tschüss. Formal: Auf Wiedersehen." },
        { t: "q", type: "article", lex: "name" },
        { t: "q", type: "article", lex: "frau" },
        { t: "q", type: "choose", prompt: "Ich ___ Ana.", opts: ["heiße", "heißt", "heißen"], a: 0, gap: true },
        { t: "q", type: "choose", art: "formal", prompt: "s0220", opts: ["Wie heißen Sie?", "Wie {heißt|heissen|du form} du?", "Tschüss!"], a: 0 },
        { t: "q", type: "pick_art", audio: "{der|d.m.nom} Mann", opts: ["ana", "paul", "nametag"], a: 1 },
        { t: "q", type: "order", sid: "s0203" }
      ]
    },
    {
      id: "L03", unit: "U01", title: "Woher kommst du?", sub: "Where you come from and where you live",
      newLex: ["kommen", "woher", "aus", "wohnen", "wo", "in", "und", "auch", "land", "stadt"],
      steps: [
        { t: "scene", art: "meet", lines: ["s0301", "s0302", "s0303", "s0304", "s0305", "s0306", "s0307", "s0308"] },
        { t: "intro", lex: "land", s: ["s0309", "s0311"] },
        { t: "intro", lex: "stadt", s: ["s0310", "s0312"] },
        { t: "note", en: "kommen aus + place: Ich komme aus Brasilien. wohnen in + place: Ich wohne in Zürich. Most countries have no article. A few do: die Schweiz → Ich wohne in der Schweiz. Also: ein Land (das) and eine Stadt (die). ein/eine follows the gender, like der/die/das.", pt: "kommen aus + lugar: Ich komme aus Brasilien. wohnen in + lugar: Ich wohne in Zürich. A maioria dos países não tem artigo. Alguns têm: die Schweiz → in der Schweiz. E: ein Land (das), eine Stadt (die)." },
        { t: "q", type: "article", lex: "land" },
        { t: "q", type: "article", lex: "stadt" },
        { t: "q", type: "pick_art", audio: "s0302", opts: ["flag_de", "flag_br", "flag_ch", "flag_pt"], a: 1 },
        { t: "q", type: "choose", prompt: "Berlin ist {eine|i.f.nom} ___.", opts: ["Stadt", "Land"], a: 0, gap: true },
        { t: "q", type: "choose", prompt: "Ich wohne ___ Zürich.", opts: ["in", "aus"], a: 0, gap: true },
        { t: "q", type: "order", sid: "s0301", alt: [] }
      ]
    },
    {
      id: "L04", unit: "U01", title: "Neu im Haus", sub: "The building, the door, the neighbours",
      newLex: ["haus", "tuer", "wohnung", "nachbar", "nachbarin", "neu", "hier", "herzlich_willkommen", "danke"],
      steps: [
        { t: "intro", lex: "haus", s: ["s0401", "s0411"] },
        { t: "intro", lex: "tuer", s: ["s0402", "s0410"] },
        { t: "intro", lex: "wohnung", s: ["s0403", "s0409"] },
        { t: "intro", lex: "nachbar", s: ["s0404"] },
        { t: "intro", lex: "nachbarin", s: ["s0405"] },
        { t: "scene", art: "knock", lines: ["s0406", "s0407", "s0408"] },
        { t: "note", en: "der Nachbar → die Nachbarin. The ending -in makes the female form, and it is always die. Words ending in -ung are always die: die Wohnung.", pt: "der Nachbar → die Nachbarin. A terminação -in forma o feminino e é sempre die. Palavras terminadas em -ung são sempre die: die Wohnung." },
        { t: "q", type: "pick_art", audio: "{die|d.f.nom} Tür", opts: ["haus", "tuer", "wohnung", "nametag"], a: 1 },
        { t: "q", type: "article", lex: "haus" },
        { t: "q", type: "article", lex: "wohnung" },
        { t: "q", type: "article", lex: "nachbar" },
        { t: "q", type: "choose", art: "knock", prompt: "s0412", opts: ["Ich bin neu hier.", "[Gute Nacht|gute_nacht]!", "Ich komme aus Berlin."], a: 0 },
        { t: "q", type: "order", sid: "x019" }
      ]
    },
    {
      id: "L05", unit: "U02", title: "Sprichst du Deutsch?", sub: "Languages you speak and learn",
      newLex: ["sprache", "sprechen", "lernen", "deutsch", "englisch", "portugiesisch", "ein_bisschen", "entschuldigung", "aber"],
      steps: [
        { t: "scene", art: "talk_lang", lines: ["s0501", "s0502", "s0503", "s0504", "s0505"] },
        { t: "intro", lex: "sprache", s: ["s0507", "s0506"] },
        { t: "scene", art: "counter_ok", lines: ["s0508", "s0509"] },
        { t: "note", en: "sprechen changes its vowel: ich spreche, du sprichst, er/sie spricht, Sie sprechen. Languages have no article: Ich spreche Deutsch.", pt: "sprechen muda a vogal: ich spreche, du sprichst, er/sie spricht, Sie sprechen. Línguas não têm artigo: Ich spreche Deutsch." },
        { t: "q", type: "article", lex: "sprache" },
        { t: "q", type: "choose", prompt: "Ich ___ Deutsch.", opts: ["spreche", "sprichst", "spricht"], a: 0, gap: true },
        { t: "q", type: "choose", prompt: "Du ___ gut Deutsch!", opts: ["spreche", "sprichst", "sprechen"], a: 1, gap: true },
        { t: "q", type: "listen_choose", audio: "s0512", opts: ["Ich spreche Englisch.", "Ich spreche Deutsch.", "Ich lerne Deutsch."], a: 2 },
        { t: "q", type: "order", sid: "s0512" }
      ]
    },
    {
      id: "L06", unit: "U02", title: "Langsamer, bitte!", sub: "When you don't understand",
      newLex: ["verstehen", "nicht", "koennen", "bitte", "langsam", "noch_einmal", "jetzt"],
      steps: [
        { t: "scene", art: "counter_fast", lines: ["s0601"], fast: true },
        { t: "scene", art: "counter_confused", lines: ["s0602", "s0603"] },
        { t: "scene", art: "counter_fast", lines: ["s0601"], slow: true },
        { t: "scene", art: "counter_ok", lines: ["s0605", "s0601", "s0606"] },
        { t: "note", en: "nicht comes after the verb here: Ich verstehe nicht. nein is only the answer no. Könnten Sie …? (could you …?) is the most polite way to ask. Learn it as a block: Könnten Sie bitte langsamer sprechen?", pt: "nicht vem depois do verbo: Ich verstehe nicht. nein é só a resposta não. Könnten Sie …? é o jeito mais educado de pedir. Decore como bloco: Könnten Sie bitte langsamer sprechen?" },
        { t: "q", type: "choose", art: "counter_confused", prompt: "s0607", opts: ["Ich verstehe nicht.", "Ich komme aus Brasilien.", "[Gute Nacht|gute_nacht]!"], a: 0 },
        { t: "q", type: "choose", art: "counter_fast", prompt: "s0608", opts: ["{Könnten|koennen|polite form: could} Sie bitte langsamer sprechen?", "Wie heißen Sie?", "[Freut mich|freut_mich]!"], a: 0 },
        { t: "q", type: "choose", prompt: "Ich verstehe ___.", opts: ["nicht", "nein"], a: 0, gap: true },
        { t: "q", type: "listen_choose", audio: "s0605", opts: ["[Noch einmal|noch_einmal], bitte.", "Nein, danke.", "[Guten Abend|guten_abend]."], a: 0 },
        { t: "q", type: "order", sid: "s0610" }
      ]
    }
  ];

  const STORIES = [
    {
      id: "ST01", unit: "U01", level: "A1", title: "Hallo, ich bin Ana", sub: "Ana meets her neighbours",
      unlockAfter: "L04",
      panels: [
        { art: "building", s: ["t0101", "t0102", "t0103", "t0104"] },
        { art: "meet", s: ["t0105", "t0106", "t0107", "t0108"] },
        { art: "meet", s: ["t0109", "t0110", "t0111", "t0112", "t0113"] },
        { art: "knock", s: ["t0114", "t0115", "t0116", "t0117"] }
      ],
      questions: [
        { type: "choose", prompt: "s0313", opts: ["Aus Brasilien.", "Aus Deutschland.", "Aus Portugal."], a: 0 },
        { type: "choose", prompt: "t0120", opts: ["{Der|d.m.nom} Nachbar.", "{Die|d.f.nom} Nachbarin.", "{Ein|i.n.nom} Land."], a: 0 },
        { type: "tf", prompt: "t0121", a: false },
        { type: "tf", prompt: "t0122", a: true },
        { type: "sequence", items: ["t0123", "t0124", "t0125"] }
      ]
    }
  ];

  // Placement test: plain text (word lens off on purpose). Bands 1..4 = A1.1, A1.2, A2.1, A2.2
  const PLACEMENT = [
    { id: "P001", band: 1, skill: "meaning", stem: "Guten Morgen!", opts: ["Good morning", "Good night", "Goodbye", "Thank you"], a: 0 },
    { id: "P010", band: 1, skill: "article", stem: "___ Haus", opts: ["der", "die", "das"], a: 2 },
    { id: "P020", band: 1, skill: "grammar", stem: "Ich ___ Ana.", opts: ["bin", "bist", "ist", "sind"], a: 0 },
    { id: "P040", band: 1, skill: "listening", audio: "Ein Kaffee, bitte.", stem: "Listen. What does the person order?", img: ["kaffee", "wasser", "brot", "tee"], a: 0 },
    { id: "P002", band: 1, skill: "meaning", stem: "die Rechnung", opts: ["the bill", "the room", "the key", "the menu"], a: 0 },
    { id: "P011", band: 1, skill: "article", stem: "___ Tür", opts: ["der", "die", "das"], a: 1 },
    { id: "P021", band: 1, skill: "grammar", stem: "Wo ___ der Bahnhof?", opts: ["ist", "sind", "bin", "bist"], a: 0 },
    { id: "P050", band: 1, skill: "reading", stem: "Das ist Paul. Er wohnt in Hamburg. Er arbeitet im Supermarkt.\n\nWhere does Paul work?", opts: ["in a supermarket", "in a hotel", "in a bank", "in a school"], a: 0 },
    { id: "P012", band: 2, skill: "article", stem: "___ Zug", opts: ["der", "die", "das"], a: 0 },
    { id: "P022", band: 2, skill: "grammar", stem: "Ich brauche ___ Hammer.", opts: ["der", "den", "dem", "des"], a: 1 },
    { id: "P023", band: 2, skill: "grammar", stem: "Er ___ um sieben Uhr auf. (aufstehen)", opts: ["steht", "stehe", "stehen", "aufsteht"], a: 0 },
    { id: "P041", band: 2, skill: "listening", audio: "Der Zug nach Berlin fährt um halb drei von Gleis vier.", stem: "Listen. What time does the train leave?", opts: ["2:30", "3:30", "2:15", "3:15"], a: 0 },
    { id: "P030", band: 2, skill: "order", words: ["heute", "ich", "arbeite", "nicht"], accept: ["Heute arbeite ich nicht", "Ich arbeite heute nicht"] },
    { id: "P003", band: 3, skill: "meaning", stem: "die Steckdose", opts: ["the outlet", "the window", "the stairs", "the lamp"], a: 0 },
    { id: "P013", band: 3, skill: "article", stem: "___ Geldbörse", opts: ["der", "die", "das"], a: 1 },
    { id: "P024", band: 3, skill: "grammar", stem: "Gestern ___ ich beim Arzt.", opts: ["war", "bin", "habe", "wurde"], a: 0 },
    { id: "P025", band: 3, skill: "grammar", stem: "Ich habe zwei Jahre in einem Restaurant ___.", opts: ["arbeite", "gearbeitet", "arbeiten", "arbeitet"], a: 1 },
    { id: "P026", band: 3, skill: "grammar", stem: "Das Buch liegt auf ___ Tisch.", opts: ["der", "den", "dem", "das"], a: 2 },
    { id: "P042", band: 3, skill: "listening", audio: "Ich habe gestern den ganzen Tag im Lager gearbeitet.", stem: "Listen. When did the person work?", opts: ["yesterday", "today", "tomorrow"], a: 0 },
    { id: "P051", band: 3, skill: "reading", stem: "Sehr geehrte Frau Weber,\nich interessiere mich für die Wohnung in der Lindenstraße. Kann ich die Wohnung am Samstag um 10 Uhr besichtigen?\nViele Grüße, Ana Silva\n\nWhat does Ana want?", opts: ["to view the apartment on Saturday at 10", "to pay the rent", "to cancel the contract", "to buy furniture"], a: 0 },
    { id: "P031", band: 3, skill: "order", words: ["morgen", "habe", "ich", "einen Termin"], accept: ["Morgen habe ich einen Termin", "Ich habe morgen einen Termin"] },
    { id: "P004", band: 4, skill: "meaning", stem: "die Kündigungsfrist", opts: ["notice period", "trial period", "holiday", "payslip"], a: 0 },
    { id: "P005", band: 4, skill: "meaning", stem: "sich beschweren", opts: ["to complain", "to relax", "to apply", "to remember"], a: 0 },
    { id: "P014", band: 4, skill: "article", stem: "___ Besteck", opts: ["der", "die", "das"], a: 2 },
    { id: "P027", band: 4, skill: "grammar", stem: "Ich komme zu spät, ___ der Zug Verspätung hat.", opts: ["weil", "denn", "aber", "und"], a: 0 },
    { id: "P028", band: 4, skill: "grammar", stem: "Dieses Zimmer ist ___ als das andere.", opts: ["groß", "größer", "am größten", "mehr groß"], a: 1 }
  ];

  const STAGES = [
    { id: "A1.1", title: "A1.1 · Survival", units: ["U01", "U02", "U03", "U04", "U05", "U06", "U07", "U08", "U09"] },
    { id: "A1.2", title: "A1.2 · Everyday life", units: ["U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18"] },
    { id: "A2.1", title: "A2.1 · Work and paperwork", units: ["U19", "U20", "U21", "U22", "U23", "U24", "U25", "U26"] },
    { id: "A2.2", title: "A2.2 · Wider conversations", units: ["U27", "U28", "U29", "U30", "U31", "U32", "U33"] }
  ];
  const UNITS = {
    U01: { title: "Hello & introductions", can: ["I can greet people at any time of day.", "I can say my name and ask for a name, with du and Sie.", "I can say where I come from and where I live."] },
    U02: { title: "When you don't understand", can: ["I can say which languages I speak.", "I can say that I don't understand.", "I can ask someone to speak slowly or repeat."] },
    U03: { title: "Numbers, time and days" }, U04: { title: "At the supermarket" }, U05: { title: "At the checkout" },
    U06: { title: "Café & restaurant" }, U07: { title: "Finding your way" }, U08: { title: "Bus & train" }, U09: { title: "Emergencies & help" },
    U10: { title: "Daily routine" }, U11: { title: "Family & friends" }, U12: { title: "Home & things" }, U13: { title: "Finding a flat" },
    U14: { title: "Clothes, colours, comparing" }, U15: { title: "Food & cooking" }, U16: { title: "Phone & internet" }, U17: { title: "Doctor & pharmacy" },
    U18: { title: "Weather & seasons" }, U19: { title: "Bank & money" }, U20: { title: "Offices & registration" }, U21: { title: "Looking for work" },
    U22: { title: "Interview & contract" }, U23: { title: "First day at work" }, U24: { title: "Tools & safety" }, U25: { title: "Hotel" },
    U26: { title: "Travel" }, U27: { title: "Problems & repairs" }, U28: { title: "Plans & free time" }, U29: { title: "Opinions & feelings" },
    U30: { title: "Telling what happened" }, U31: { title: "Services & complaints" }, U32: { title: "Plans for the future" }, U33: { title: "Final A2 review" }
  };

  // stories that are planned (spec, Appendix E); shown as "coming soon"
  const PLANNED_STORIES = [
    ["ST02", "A1", "Ich verstehe nicht", "U02"], ["ST03", "A1", "Im Supermarkt", "U05"], ["ST04", "A1", "Ein Kaffee, bitte", "U06"],
    ["ST05", "A1", "Wo ist der Bahnhof?", "U07"], ["ST06", "A1", "Der Zug hat Verspätung", "U08"], ["ST07", "A1", "Ein neuer Tag", "U10"],
    ["ST08", "A1", "Das ist meine Familie", "U11"], ["ST09", "A1", "Die Wohnung", "U13"], ["ST10", "A1", "Beim Arzt", "U17"],
    ["ST11", "A2", "Das Konto", "U19"], ["ST14", "A2", "Das Vorstellungsgespräch", "U22"], ["ST15", "A2", "Der erste Arbeitstag", "U23"]
  ].map(([id, level, title, unit]) => ({ id, level, title, unit }));
  UNITS.U01.cover = "meet"; UNITS.U01.sub = "Meet your neighbours and introduce yourself.";
  UNITS.U02.cover = "counter_confused"; UNITS.U02.sub = "Say what you speak, and ask people to slow down.";
  window.CONTENT = { LEX, FORMS, SENT, LESSONS, STORIES, PLACEMENT, STAGES, UNITS, PLANNED_STORIES };
})();
