# SmileCRM Gaxtniutyan Qaghaqakanutyan

**Gortsoxutyan amsakic:** {{DATE}}  
**Tarberak:** {{VERSION}}

---

## Hamarot (TL;DR)

- SmileCRM-y atamabnujakan bjishkneri hamar gortsiq e՝ pacientneri, aycelutyunneri ev bujman planneri hashvarkum.
- Menq pahpanum enq miajn ayn tvyalnery, vor duq mutqagrum eq: bjishki, pacientneri, aycelutyunneri masin teghekatvutyun.
- Dzer tvyalnery pashpanvac en: Telegram-ov avtorizacia, JWT-tokener, tvyalneri bajanun bjishkneri mijoc.
- Menq chenq vacharum tvyalnery yerord koghmerun ev chenq pahpanum bankajin qartayin tvyalnery.
- Duq karox eq haycum uxxarkel dzer hashive ev bolor tvyalnery jnjelu.

---

## A. Menq ovqer enq

**SmileCRM**-y atamabnujakan praktikaji karavarmani hamar tsarayutyun e, hasaneli e vorpes Telegram Mini App.

**Tvyalneri operator:**  
{{COMPANY_NAME}}  
{{ADDRESS}}  
Email: {{EMAIL}}

SmileCRM-y handisanum e vorpes gortsiq matakararar (tvyalneri mshakox) bjishkneri hamar, ovqer hisanutyun en irenc pacientneri tvyalneri kontrolyornery.

---

## B. Inch tvyalner enq havaqum

### Bjishki tvyalner (hashiv)
- Anun ev azganun
- Masnagitutyun
- Herakhosahamary
- Klinikaji anun
- Telegram User ID
- Phordzashyani ev bajanorvdagrutyun amsakitsnery

### Pacientneri tvyalner
- Anun ev azganun
- Herakhosahamar (ocpardatir)
- Akhtorosum ev bjishki nkatutyunner
- Bujman kargavichak
- Bujman plan ev vacharner
- Cnndyan amsakit, ser (ocpardatir)

> ⚠️ **Karovor:** Akhtoroshumnery ev bjshkakan nkatutyunnery verlum en aroghjutyan masin tvyalnerin ev patanjum en bardratsvac pashpanutyun.

### Aycelutyan tvyalner
- Aycelutyan amsakit ev hajord aycelutyan amsakit
- Bjishki nkatutyunner
- Nshanakved degher

### Media faylery
- Rentgen lusankarner
- Luzankarner (araj/heto buzhyunits)
- Faylery kapvac en konkret pacientin ev bjshkin

### Tekhnikkakan tvyalner
- Telegram User ID ev initData tvyalner (avtorizaciayi hamar)
- IP hascen (serveri lognerum, nvagazujn pahpanum)
- Sarqi tesy ev browsery (avtomatik Telegram-ic)

### Vcharmyan tvyalner
- Vcharman ID-y matakarararirc (Idram/IDBank)
- Gumar ev arjhuyt (AMD)
- Vcharman kargavichak
- Gorcariqi amsakit

> **Menq CHenq pahpanum bankajin qartayin tvyalner:** Bolor vcharnery mshakvm en uxxakioren Idram ev IDBank matakarararneri koxmic.

---

## C. Tvyalneri mshakman npatakner

Menq mshakum enq tvyalnery hetevyal npataknerov:

1. **Tsarayutyan matucum** — pacientneri, aycelutyunneri, bujman planneri hashvarkum
2. **Anvtangutyun** — pashpanutyun charashahman mtqic ev charashahumnerisic
3. **Ognutyun ogtagoroxnerin** — harcerun patasxanner ev xndirneri lucum
4. **Vcharneri mshakum** — bajanorvdagrutyun karavarul
5. **Artadranki barelavum** — hamaxmbvac analitika ogtagurcutyan (aranc andzhnakan tvyalneri)

---

## D. Iravakan himqer

Menq mshakum enq tvyalnery hetevyal himqerov:

- **Paymanagreri katarum** — SmileCRM tsarayutyan matucum
- **Orinakan sharher** — anvtangutyan apahovum ev khertsanqi kanxargelum
- **Hamadzaynutyun** — marketingayin haskagrutyunneri hamar (yete kirarvum e)

---

## E. Tvyalneri poxancum yereord koghmerun

Menq karog enq poxancel tvyalnery hetevyal kategorianeri stacoxnerin:

| Stacox | Npatak | Tvyalneri tesy |
|--------|--------|----------------|
| **Supabase** | Tvyalneri bazayi ev fayleri pahpanum | Bolor tvyalnery |
| **Telegram** | Ogtagoroxneri avtorizacia | Telegram ID, initData |
| **Idram / IDBank** | Vcharneri mshakum | Vcharneri ID-ner |
| **Render / Vercel** | Havelvaci hosting | Tekhnikkakan tvyalner |

Menq naev karog enq bacahaytel tvyalnery iravapah marminneri orinakan patanji hamar.

---

## F. Mijazkajin poxancum

Mer matakarararneri serverinery (Supabase, Render, Vercel) karog en gtnyel Hajastanic durs. Menq kirarum enq kazmakerpakayin ev tekhnikkakan mijocner tvyalneri pashpanman hamar mijazkajin poxancman jamanak.

---

## G. Tvyalneri pahpanman jamketnery

- **Hashvi ev pacientneri tvyalner** — pahpanvum en minchev hashivy aktiv e, plus barexos jamketa jnjumits heto verkakngnman hnararutyan hamar
- **Vcharmyan grancumner** — {{PAYMENTS_RETENTION}} (hashvapahakan ev iravakan npataknerov)
- **Serveri logner** — minchev 30 or

Jamketnerit avartveluts heto tvyalnery jnjum en kam anonimazacvum en.

---

## H. Tvyalneri anvtangutyun

Menq kirarum enq hetevyal pashpanman mijocner:

- ✅ **Telegram initData verificia** — stugum enq storgrut yurakanchyur avtorizaciayin
- ✅ **JWT-tokener** — anvtang authentifikacia API hartneri hamar
- ✅ **Tvyalneri bajanun** — yurakanchyur bjishk tesum e miajn ir pacientnerin (filtrum enq doctor_id-ov)
- ✅ **Gaxtnagrum poxancman jamanak** — HTTPS bolor kapakculyunneri hamar
- ✅ **Row Level Security** — mtqi sahmanapordum tvyalneri bazayi makardakov
- ✅ **Mtqi minimalizacia** — miajn anhrashesht andznakazmy unic mtq tvyalnerun

> ⚠️ Chnayjac dzernarkavac mijocnerin, voch mic hamakar@ chi karog erajavorel 100% anvtangutyun. Menq xorrhurq enq talis ogtavel husali gaghtnabarery ev chi poxancel mtqi tvyalnery yerord andzanc.

---

## I. Dzer iravunqnery

Vorpes SmileCRM ogtavorox, duq iravunq uneq:

- 📋 **Mtq** — stanaly dzer tvyalneri patxeny
- ✏️ **Shpum** — tarmacnel votachisht tvyalnery
- 🗑️ **Jnjum** — haycum anely hashvi ev bolor tvyalneri jnjman
- 📤 **Artahanum** — stanaly tvyalnery mexenayngnyeli dzevachapov (yete tekhnikkapes hnararvor e)
- ⛔ **Hamadzaynutyan hishoxarkum** — grasanvel marketingayin haskagrutyunnerisn

**Vonts nerkayacnel haytadrum:**  
Uxxarkel email {{EMAIL}}-in «Haytadrum tvyalneri masin» temayov ev nshel dzer Telegram username-y.

Menq kapatasxanenq 30 orva yntacqum.

---

## J. Bjishki patasxanatvutyun pacientneri tvyalneri hamar

**Karovor e haskanel:**

- Bjishky hisanum e ir pacientneri tvyalneri **kontrolyor**
- SmileCRM-y hisanum e **tvyalneri mshakox** (matakararum e gortsiq)
- Bjishky partavorvum e:
  - Unenalov orinakan himq pacientneri tvyalner havaqelu hamar
  - Teghekacnel pacientnerin irenc tvyalneri mshakman masin
  - Apahovel tvyalneri gaxtniutyun
  - Chi poxancel hashvi mtq yerord andzanc

SmileCRM-y patasxanatvutyun chi krsum bjishki gortsoxutyunneri hamar ir pacientneri tvyalneri nkatmamb.

---

## K. Erekhaner

SmileCRM-y naxatesvac chi 18 taruc pokr andzanc koxmic orpes ogtavoroxner (bjishkner) ogtagerelun hamar. Menq gitakicoren chi havaqum erekhanneri tvyalner.

Antachahac pacientneri tvyalnery karog en mutqagrvevel bjishki koxmic bjshkakan praktikaji shrjanaknnerum — dra hamar patasxanatvutyun e krum bjishky.

---

## L. Cookies ev tracking

SmileCRM-y vorpes Telegram Mini App **chi ogtavorum cookies**:

Menq ogtavorum enq browseryi **localStorage**-y miajn hetevyal hamar:
- Entrvac lezvi pahpanman hamar
- Avtorizaciayi tokeni pahpanman hamar (JWT)

Menq chi ogtavorum gavazyayin trackernerr kam yerord koghmi analyitika.

---

## M. Qaghaqakanutyan popoxutyunner

Menq karog enq tarmacnel ays Gaxtniutyan qaghaqakanutyan. Eshakan popoxutyunneri depqum menq kteghekacnenq dzer havelvaci mijocov.

Ardiakanal tarberkay misht hasaneli e havelvacum «Gaxtniutyun» hskayov.

---

## N. Kapner

Gaxtniutyan harcerumnerov dimum:

**{{COMPANY_NAME}}**  
Email: {{EMAIL}}  
Hascey: {{ADDRESS}}

---

*Verjin tarmacum: {{DATE}}*
