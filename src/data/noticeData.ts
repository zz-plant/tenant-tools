export const issueOptions = [
  {
    id: "heat",
    label: "🔥 Heat not working / not warm enough",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nCondition: heat not working / not warm enough.\nStart date: [START DATE].\nToday: [TODAY]. Temperature: [TEMP]°F at [TIME].\nPlease provide the repair date and time.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nLa calefacción no funciona / no está lo suficientemente caliente.\nEsto comenzó el [START DATE].\nHoy es [TODAY]. La temperatura es [TEMP]°F a las [TIME].\nPor favor dígame cuándo arreglarán la calefacción.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nहीट काम नहीं कर रही है / पर्याप्त गर्म नहीं है।\nयह [START DATE] को शुरू हुआ।\nआज [TODAY] है। [TIME] पर तापमान [TEMP]°F है।\nकृपया बताएं कि आप हीट कब ठीक करेंगे।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nOgrzewanie nie działa / nie grzeje wystarczająco.\nProblem zaczął się [START DATE].\nDziś jest [TODAY]. Temperatura to [TEMP]°F o [TIME].\nProszę powiedzieć, kiedy zostanie naprawione ogrzewanie.\n\nDziękuję,\n`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: heat still not working.\nPlease provide the repair date and time.\n\n`,
        es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre la calefacción.\nAún no está arreglada.\nPor favor dígame la fecha y hora de la reparación.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को हीट के बारे में लिखा था।\nयह अभी भी ठीक नहीं हुआ है।\nकृपया मरम्मत की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] w sprawie ogrzewania.\nNadal nie jest naprawione.\nProszę podać datę i godzinę naprawy.\n\nDziękuję,\n`,
      },
      C: {
        en: `Start date: [START DATE].\nCondition today: heat still not working.\nPlease provide the repair date today.\nIf it is not scheduled soon, I will contact the City (311) for an inspection.\n\n`,
        es: `Hola,\n\nEl problema de la calefacción comenzó el [START DATE] y aún no está arreglado.\nNecesito una fecha de reparación hoy.\nSi no se arregla pronto, contactaré a la Ciudad (311) para una inspección.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nहीट की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nमुझे आज मरम्मत की तारीख चाहिए।\nयदि जल्द ठीक नहीं हुआ, तो मैं City (311) से निरीक्षण के लिए संपर्क करूंगा/करूंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nProblem z ogrzewaniem zaczął się [START DATE] i nadal nie jest naprawiony.\nPotrzebuję dziś daty naprawy.\nJeśli nie zostanie szybko naprawione, skontaktuję się z miastem (311) w sprawie inspekcji.\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `I live at [ADDRESS].\nCondition: heat not working.\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
    },
  },
  {
    id: "leak",
    label: "💧 Water leak / ceiling leak / water damage",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nCondition: water leak / water coming in at [LOCATION].\nStart date: [START DATE].\nPlease provide the repair date and time.\nI am attaching photos/videos.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nHay una fuga de agua / entra agua en [LOCATION].\nEsto comenzó el [START DATE].\nPor favor dígame cuándo lo arreglarán.\nAdjunto fotos/videos.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[LOCATION] पर पानी का रिसाव / पानी आ रहा है।\nयह [START DATE] को शुरू हुआ।\nकृपया बताएं कि आप इसे कब ठीक करेंगे।\nमैं फोटो/वीडियो संलग्न कर रहा/रही हूँ।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nWystępuje przeciek wody / woda wchodzi w [LOCATION].\nProblem zaczął się [START DATE].\nProszę powiedzieć, kiedy to zostanie naprawione.\nZałączam zdjęcia/wideo.\n\nDziękuję,\n`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: water leak still happening / not fixed.\nPlease provide the repair date and time.\n\n`,
        es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre la fuga de agua.\nSigue ocurriendo / no está arreglada.\nPor favor dígame la fecha y hora de la reparación.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को पानी के रिसाव के बारे में लिखा था।\nयह अभी भी हो रहा है / ठीक नहीं हुआ है।\nकृपया मरम्मत की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] w sprawie przecieku.\nProblem nadal występuje / nie jest naprawiony.\nProszę podać datę i godzinę naprawy.\n\nDziękuję,\n`,
      },
      C: {
        en: `Start date: [START DATE].\nCondition today: water leak still not fixed.\nPlease confirm the repair date today.\nIf it is not scheduled soon, I will contact the City (311) to report the condition.\n\n`,
        es: `Hola,\n\nLa fuga de agua comenzó el [START DATE] y aún no está arreglada.\nPor favor confirme la fecha de reparación hoy.\nSi no se arregla pronto, contactaré a la Ciudad (311) para reportarlo.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nपानी का रिसाव [START DATE] को शुरू हुआ और अब भी ठीक नहीं हुआ है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\nयदि जल्द ठीक नहीं हुआ, तो मैं City (311) को रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPrzeciek wody zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś potwierdzić datę naprawy.\nJeśli nie zostanie szybko naprawione, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `I live at [ADDRESS].\nCondition: water leak at [LOCATION].\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
    },
  },
  {
    id: "pests",
    label: "🪳 Pests (roaches / rats / bedbugs)",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nCondition: [ROACHES/RATS/BEDBUGS] seen.\nDate seen: [START DATE].\nCondition today: still happening.\nPlease schedule pest treatment and provide the date and time.\nI can share photos if needed.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nVi [ROACHES/RATS/BEDBUGS] el [START DATE].\nEl problema sigue ocurriendo.\nPor favor programe el tratamiento y dígame la fecha y hora.\nPuedo compartir fotos si es necesario.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nमैंने [START DATE] को [ROACHES/RATS/BEDBUGS] देखा।\nसमस्या अभी भी हो रही है।\nकृपया कीट उपचार शेड्यूल करें और तारीख/समय बताएं।\nज़रूरत हो तो मैं फोटो साझा कर सकता/सकती हूँ।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nWidziałem/am [ROACHES/RATS/BEDBUGS] dnia [START DATE].\nProblem nadal występuje.\nProszę zaplanować zabieg i podać datę oraz godzinę.\nMogę udostępnić zdjęcia, jeśli potrzeba.\n\nDziękuję,\n`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: pest problem still not fixed.\nPlease provide the treatment date and time.\n\n`,
        es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre plagas.\nEl problema aún no está resuelto.\nPor favor dígame la fecha y hora del tratamiento.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को कीटों के बारे में लिखा था।\nसमस्या अभी भी ठीक नहीं हुई है।\nकृपया उपचार की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPisałem/am [DATE OF FIRST MESSAGE] w sprawie szkodników.\nProblem nadal nie jest rozwiązany.\nProszę podać datę i godzinę zabiegu.\n\nDziękuję,\n`,
      },
      C: {
        en: `Start date: [START DATE].\nCondition today: pest problem still not fixed.\nPlease confirm the treatment date today.\nIf it is not scheduled soon, I will contact the City (311).\n\n`,
        es: `Hola,\n\nEl problema de plagas comenzó el [START DATE] y aún no está resuelto.\nPor favor confirme hoy la fecha del tratamiento.\nSi no se programa pronto, contactaré a la Ciudad (311).\n\nGracias,\n`,
        hi: `नमस्ते,\n\nकीटों की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nकृपया आज उपचार की तारीख की पुष्टि करें।\nयदि जल्द शेड्यूल नहीं हुआ, तो मैं City (311) से संपर्क करूंगा/करूंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nProblem ze szkodnikami zaczął się [START DATE] i nadal nie jest rozwiązany.\nProszę dziś potwierdzić datę zabiegu.\nJeśli wkrótce nie zostanie zaplanowany, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `I live at [ADDRESS].\nCondition: pests seen.\nDate seen: [START DATE].\nPlease schedule treatment and provide the date.\n\n`,
    },
  },
  {
    id: "entry",
    label: "🚪 Entry without notice / access problems",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nEntry without notice happened on [DATE].\nIn Chicago, landlords must give 48 hours’ notice before entry (except emergencies).\nPlease confirm future entry will follow the 48-hour notice rule.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nEl [DATE], alguien entró / intentó entrar sin aviso.\nEn Chicago, los propietarios deben dar 48 horas de aviso antes de entrar (excepto emergencias).\nPor favor confirme que dará 48 horas de aviso en el futuro.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[DATE] को किसी ने बिना सूचना के मेरे यूनिट में प्रवेश किया / कोशिश की।\nChicago में, आपात स्थिति को छोड़कर, प्रवेश से पहले 48 घंटे की सूचना देनी होती है।\nकृपया पुष्टि करें कि आप भविष्य में 48 घंटे की सूचना देंगे।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nDnia [DATE] ktoś wszedł / próbował wejść do mojego lokalu bez powiadomienia.\nW Chicago właściciele muszą dać 48 godzin powiadomienia przed wejściem (poza nagłymi sytuacjami).\nProszę potwierdzić, że w przyszłości będzie 48 godzin powiadomienia.\n\nDziękuję,\n`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nEntry without notice happened again on [DATE].\nPlease confirm future entry will follow the 48-hour notice rule.\n\n`,
        es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre el aviso de entrada.\nEsto volvió a ocurrir el [DATE].\nPor favor confirme que seguirá la regla de 48 horas en adelante.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को प्रवेश सूचना के बारे में लिखा था।\nयह [DATE] को फिर से हुआ।\nकृपया पुष्टि करें कि आगे से आप 48 घंटे की सूचना का पालन करेंगे।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPisałem/am [DATE OF FIRST MESSAGE] w sprawie powiadomienia o wejściu.\nTo zdarzyło się ponownie [DATE].\nProszę potwierdzić, że będzie przestrzegana zasada 48 godzin.\n\nDziękuję,\n`,
      },
      C: {
        en: `Entry without proper notice happened on [DATES].\nPlease confirm in writing that future entry will follow the 48-hour notice rule.\nIf it happens again, I will report the issue for help.\n\n`,
        es: `Hola,\n\nLa entrada sin el aviso adecuado ocurrió el [DATES].\nPor favor confirme por escrito que en el futuro se seguirá la regla de 48 horas.\nSi vuelve a ocurrir, reportaré el problema para obtener ayuda.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nबिना सही सूचना के प्रवेश [DATES] को हुआ।\nकृपया लिखित रूप में पुष्टि करें कि भविष्य में 48 घंटे की सूचना का पालन होगा।\nयदि यह फिर हुआ, तो मैं सहायता के लिए रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nWejście bez właściwego powiadomienia miało miejsce [DATES].\nProszę pisemnie potwierdzić, że w przyszłości będzie przestrzegana zasada 48 godzin.\nJeśli to się powtórzy, zgłoszę sprawę po pomoc.\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `I live at [ADDRESS].\nEntry without notice happened on [DATE].\nPlease give 48 hours’ notice going forward.\n\n`,
    },
  },
  {
    id: "common",
    label: "🛗 Elevator / common areas",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nCondition: problem with [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nStart date: [START DATE].\nPlease provide the repair date and time.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nHay un problema con [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nEsto comenzó el [START DATE].\nPor favor dígame cuándo se reparará.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM] में समस्या है।\nयह [START DATE] को शुरू हुई।\nकृपया बताएं कि इसे कब ठीक किया जाएगा।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nJest problem z [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nProblem zaczął się [START DATE].\nProszę powiedzieć, kiedy zostanie naprawione.\n\nDziękuję,\n`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: common area issue still not fixed.\nPlease provide the repair date.\n\n`,
        es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre el problema en el área común.\nAún no está arreglado.\nPor favor dígame la fecha de reparación.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को साझा क्षेत्र की समस्या के बारे में लिखा था।\nयह अभी भी ठीक नहीं है।\nकृपया मरम्मत की तारीख बताएं।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nPisałem/am [DATE OF FIRST MESSAGE] w sprawie części wspólnych.\nNadal nie jest naprawione.\nProszę podać datę naprawy.\n\nDziękuję,\n`,
      },
      C: {
        en: `Start date: [START DATE].\nCondition today: common area issue still not fixed.\nPlease confirm the repair date today.\nIf it is not addressed soon, I will contact the City (311) to report it.\n\n`,
        es: `Hola,\n\nEl problema en el área común comenzó el [START DATE] y aún no está arreglado.\nPor favor confirme la fecha de reparación hoy.\nSi no se atiende pronto, contactaré a la Ciudad (311) para reportarlo.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nसाझा क्षेत्र की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\nयदि जल्द समाधान नहीं हुआ, तो मैं City (311) को रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nProblem w częściach wspólnych zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś potwierdzić datę naprawy.\nJeśli nie zostanie szybko rozwiązany, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `I live at [ADDRESS].\nCondition: problem with a common area.\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
    },
  },
  {
    id: "no-timeline",
    label: "🧾 “We are working on it” / no timeline",
    notices: {
      A: {
        en: `Please provide the repair date.\nIf there is no date, provide the next step and the exact day it will happen.\n\n`,
        es: `Hola,\n\nGracias por su mensaje.\nPor favor dígame la fecha de reparación.\nSi no tiene una fecha, por favor dígame el siguiente paso y el día exacto en que ocurrirá.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nआपके संदेश के लिए धन्यवाद।\nकृपया मरम्मत की तारीख बताएं।\nयदि तारीख नहीं है, तो कृपया अगला कदम और सटीक दिन बताएं।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nDziękuję za wiadomość.\nProszę podać datę naprawy.\nJeśli nie ma daty, proszę podać następny krok i dokładny dzień.\n\nDziękuję,\n`,
      },
      B: {
        en: `I still do not have a repair date.\nStart date: [START DATE].\nCondition today: still not fixed.\nPlease reply with a date today.\n\n`,
        es: `Hola,\n\nTodavía no tengo una fecha de reparación.\nEl problema comenzó el [START DATE] y aún no está arreglado.\nPor favor responda con una fecha hoy.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमुझे अभी भी मरम्मत की तारीख नहीं मिली है।\nसमस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nकृपया आज तारीख के साथ जवाब दें।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nNadal nie mam daty naprawy.\nProblem zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś odpowiedzieć z datą.\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `Please provide the repair date.\nIf there is no date, provide the next step and the exact day.\n\n`,
    },
  },
  {
    id: "deposit",
    label: "💰 Security deposit (move-out deadlines)",
    notices: {
      A: {
        en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nCondition: no itemized list of deductions received.\nPlease send the itemized list.\n\n`,
        es: `Hola,\n\nMe mudé de [ADDRESS] el [MOVE-OUT DATE].\nNo he recibido una lista detallada de deducciones.\nPor favor envíe la lista detallada.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] से [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे कटौतियों की आइटमाइज़्ड सूची नहीं मिली है।\nकृपया सूची भेजें।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nWyprowadziłem/am się z [ADDRESS] dnia [MOVE-OUT DATE].\nNie otrzymałem/am wyszczególnionej listy potrąceń.\nProszę przesłać listę.\n\nDziękuję,\n`,
      },
      B: {
        en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nCondition: security deposit not returned.\nPlease return the security deposit and any required interest.\n\n`,
        es: `Hola,\n\nMe mudé de [ADDRESS] el [MOVE-OUT DATE].\nNo he recibido mi depósito de seguridad.\nPor favor devuelva mi depósito y cualquier interés requerido.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] से [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे मेरा सुरक्षा जमा वापस नहीं मिला है।\nकृपया मेरा जमा और आवश्यक ब्याज वापस करें।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nWyprowadziłem/am się z [ADDRESS] dnia [MOVE-OUT DATE].\nNie otrzymałem/am zwrotu kaucji.\nProszę zwrócić kaucję i wymagane odsetki.\n\nDziękuję,\n`,
      },
      C: {
        en: `Move-out date: [MOVE-OUT DATE].\nCondition: deposit and required information not received.\nPlease provide the deposit and required information, with a date for delivery.\nIf it is not provided soon, I will take the next normal step.\n\n`,
        es: `Hola,\n\nMe mudé el [MOVE-OUT DATE].\nTodavía no he recibido mi depósito ni la información requerida.\nSi no lo recibo pronto, tomaré el siguiente paso para hacer valer mis derechos.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे अभी भी मेरा जमा और आवश्यक जानकारी नहीं मिली है।\nयदि जल्द नहीं मिला, तो मैं अपने अधिकारों की रक्षा के लिए अगला कदम उठाऊंगा/उठाऊंगी।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nWyprowadziłem/am się [MOVE-OUT DATE].\nNadal nie otrzymałem/am kaucji i wymaganych informacji.\nJeśli wkrótce nie otrzymam, podejmę następny krok w celu ochrony moich praw.\n\nDziękuję,\n`,
      },
    },
    simple: {
      en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nPlease return the security deposit.\n\n`,
    },
  },
  {
    id: "lockout",
    label: "🚫 Lockout / utility shutoff threats",
    notices: {
      A: {
        en: `I live at [ADDRESS].\nStatement received: [LOCK ME OUT / SHUT OFF UTILITIES] on [DATE].\nThat is not allowed in Chicago without a court process.\nPlease confirm in writing that you will not lock me out or shut off utilities.\n\n`,
        es: `Hola,\n\nVivo en [ADDRESS].\nUsted dijo que podría [LOCK ME OUT / SHUT OFF UTILITIES] el [DATE].\nEso no está permitido en Chicago sin un proceso judicial.\nPor favor confirme por escrito que no me cerrará el acceso ni cortará los servicios.\n\nGracias,\n`,
        hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nआपने कहा कि आप [LOCK ME OUT / SHUT OFF UTILITIES] [DATE] को कर सकते हैं।\nChicago में अदालत की प्रक्रिया के बिना यह अनुमति नहीं है।\nकृपया लिखित में पुष्टि करें कि आप मुझे बाहर नहीं करेंगे या यूटिलिटी बंद नहीं करेंगे।\n\nधन्यवाद,\n`,
        pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nPowiedzieli Państwo, że mogą Państwo [LOCK ME OUT / SHUT OFF UTILITIES] dnia [DATE].\nW Chicago jest to niedozwolone bez postępowania sądowego.\nProszę pisemnie potwierdzić, że nie zostanę wyrzucony/a ani nie zostaną odcięte media.\n\nDziękuję,\n`,
      },
      B: {
        en: `Utilities were shut off / service was interrupted on [DATE/TIME].\nPlease restore service and confirm the restoration date and time.\n\n`,
        es: `Hola,\n\nLos servicios fueron cortados / interrumpidos el [DATE/TIME].\nPor favor restablezca el servicio de inmediato y confirme cuándo se restablecerá.\n\n`,
        hi: `नमस्ते,\n\n[DATE/TIME] को यूटिलिटी बंद कर दी गई / सेवा बाधित हुई।\nकृपया तुरंत सेवा बहाल करें और बताएं कि यह कब बहाल होगी।\n\n`,
        pl: `Dzień dobry,\n\nMedia zostały odcięte / usługa została przerwana [DATE/TIME].\nProszę natychmiast przywrócić usługę i potwierdzić, kiedy zostanie przywrócona.\n\n`,
      },
    },
    simple: {
      en: `Please confirm in writing that you will not lock me out or shut off utilities.\n\n`,
    },
  },
  {
    id: "building",
    label: "🏢 Building-wide message",
    notices: {
      A: {
        en: `We are residents at [ADDRESS].\nCondition: multiple residents report the same issue.\nIssue: [ISSUE].\nStart date: around [START DATE].\nPlease provide the repair plan and expected repair date.\n\nResidents of [ADDRESS]`,
        es: `Hola,\n\nSomos residentes en [ADDRESS].\nVarios residentes informan el mismo problema:\n[ISSUE].\n\nEsto comenzó alrededor de [START DATE].\nPor favor díganos el plan de reparación y la fecha estimada.\n\nGracias,\nResidentes de [ADDRESS]`,
        hi: `नमस्ते,\n\nहम [ADDRESS] के निवासी हैं।\nकई निवासी एक ही समस्या की रिपोर्ट कर रहे हैं:\n[ISSUE].\n\nयह लगभग [START DATE] को शुरू हुआ।\nकृपया मरम्मत की योजना और अपेक्षित तारीख बताएं।\n\nधन्यवाद,\n[ADDRESS] के निवासी`,
        pl: `Dzień dobry,\n\nJesteśmy mieszkańcami [ADDRESS].\nWielu mieszkańców zgłasza ten sam problem:\n[ISSUE].\n\nProblem zaczął się około [START DATE].\nProszę podać plan naprawy i przewidywaną datę.\n\nDziękujemy,\nMieszkańcy [ADDRESS]`,
      },
      B: {
        en: `First message date: [DATE OF FIRST MESSAGE].\nIssue: [ISSUE].\nCondition today: still not fixed.\nPlease confirm the repair date today.\n\nResidents of [ADDRESS]`,
        es: `Hola,\n\nLe escribimos el [DATE OF FIRST MESSAGE] sobre [ISSUE].\nAún no está arreglado.\nPor favor confirme hoy la fecha de reparación.\n\nGracias,\nResidentes de [ADDRESS]`,
        hi: `नमस्ते,\n\nहमने [DATE OF FIRST MESSAGE] को [ISSUE] के बारे में लिखा था।\nयह अभी भी ठीक नहीं हुआ है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\n\nधन्यवाद,\n[ADDRESS] के निवासी`,
        pl: `Dzień dobry,\n\nPisaliśmy [DATE OF FIRST MESSAGE] w sprawie [ISSUE].\nNadal nie jest naprawione.\nProsimy dziś potwierdzić datę naprawy.\n\nDziękujemy,\nMieszkańcy [ADDRESS]`,
      },
    },
    simple: {
      en: `We are residents at [ADDRESS].\nBuilding-wide issue: [ISSUE].\nPlease provide the repair plan and date.\n\nResidents of [ADDRESS]`,
    },
  },
];

export const zoneOptions = [
  { id: "common_area", label: "Common area" },
  { id: "hallway", label: "Hallway or stairwell" },
  { id: "unit_interior", label: "Inside unit" },
  { id: "entry", label: "Entry or lobby" },
  { id: "unknown", label: "Not sure" },
];

export const issue311Guidance: Record<
  string,
  {
    category: string;
    script: string;
    nextStep: string;
  }
> = {
  heat: {
    category: "No heat",
    script: "The heat has not been warm enough since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  leak: {
    category: "Water leak",
    script: "There is ongoing water leaking at [LOCATION] since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  pests: {
    category: "Pest issue",
    script: "I have seen pests since [START DATE] and the problem is still happening.",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
  entry: {
    category: "Entry without notice",
    script: "Someone entered without notice on [DATE].",
    nextStep:
      "Common paths tenants encounter include a city follow-up. A risk is a documentation gap if dates or prior notices are missing.",
  },
  common: {
    category: "Common area problem",
    script: "There is a common area problem since [START DATE].",
    nextStep:
      "Common paths tenants encounter include an inspection request. A risk is unclear timing and documentation gaps if dates or photos are missing.",
  },
};

export const fieldDefinitions = {
  temp: { label: "Temperature (°F)", type: "number", placeholder: "68" },
  time: { label: "Time", type: "time" },
  location: { label: "Location (for leaks)", placeholder: "kitchen ceiling" },
  attachment: { label: "Evidence note (optional)", placeholder: "photo of ceiling leak" },
  eventDate: { label: "Event date", type: "date" },
  eventDates: { label: "Event date(s)", placeholder: "[DATES]" },
  eventDateTime: { label: "Event date/time", placeholder: "[DATE/TIME]" },
  moveOutDate: { label: "Move-out date", type: "date" },
  pestType: { label: "Pest type (roaches/rats/bedbugs)", placeholder: "ROACHES" },
  commonArea: { label: "Common area item", placeholder: "ELEVATOR" },
  lockoutAction: { label: "Lockout or shutoff action", placeholder: "LOCK ME OUT" },
  issueDescription: { label: "Issue description (building-wide)", placeholder: "broken elevator" },
} as const;

export type FieldDefinitionKey = keyof typeof fieldDefinitions;

export const issueFieldMap = {
  heat: ["temp", "time"],
  leak: ["location", "attachment"],
  pests: ["pestType", "attachment"],
  entry: ["eventDate", "eventDates", "attachment"],
  common: ["commonArea", "attachment"],
  "no-timeline": [],
  deposit: ["moveOutDate"],
  lockout: ["lockoutAction", "eventDate", "eventDateTime", "attachment"],
  building: ["issueDescription", "attachment"],
};

export const stages = {
  A: "Initial notice",
  B: "Follow-up",
  C: "Final notice",
};

export const meaningMap = {
  A: ["States the problem", "Creates a clear written record", "Asks for a repair date"],
  B: ["Repeats the request", "Shows the issue is ongoing", "Asks for a specific date"],
  C: ["Sets urgency", "States the timeline", "Signals a next step if unresolved"],
};
