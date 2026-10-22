import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, 'assets', 'audio');

// =========================================================================
// ZERO-DEPENDENCY .ENV LOADER
// =========================================================================
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...values] = trimmed.split('=');
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').replace(/^['"]|['"]$/g, '').trim();
    }
  }
}

// =========================================================================
// CONFIGURATION (ELEVEN_V4_TURBO)
// =========================================================================
const ELEVENLABS_KEY = (process.env.ELEVENLABS_KEY || "sk_c7ac0b8cd7352d8cdac39b17cb225b8aabd2b35b466cd53a").trim();
const ELEVEN_VOICE_ID = (process.env.ELEVEN_VOICE_ID || "BA7J4hGNUU1mpEBVmiIA").trim(); // Super PG / Cinematic Voice
const ELEVEN_MODEL_ID = "eleven_v4_turbo";

// पुराने ऑडियो फाइल्स को नए हुकी वॉयसओवर से ओवरराइट करने के लिए true रखा गया है
const FORCE_OVERWRITE = true;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`  ⚠️ Attempt ${i + 1}/${retries} failed (${err.message}). Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
}

// =========================================================================
// 15 PRESIDENTS: HOOKY STORYTELLING & UNTOLD INCIDENTS MANIFEST
// =========================================================================
const STORY_MANIFEST = [
  {
    id: '01_rajendra_prasad',
    name: 'Dr. Rajendra Prasad',
    hookTitle: 'The President Who Donated 75% Salary & Did Duty Over Grief',
    text: 'Did you know India’s first President refused seventy-five percent of his own salary? Living with absolute simplicity, on the eve of the very first Republic Day, when his beloved sister passed away, Dr. Rajendra Prasad finished the national parade first before lighting her funeral pyre.'
  },
  {
    id: '02_s_radhakrishnan',
    name: 'Dr. Sarvepalli Radhakrishnan',
    hookTitle: 'When Students Replaced Horses & Stalin Broke Protocol',
    text: 'When Dr. Radhakrishnan left Calcutta University, emotional students unhitched the horses and pulled his carriage themselves all the way to the railway station! Even Soviet dictator Joseph Stalin broke Kremlin protocol just to sit with this Indian philosopher in private.'
  },
  {
    id: '03_zakir_husain',
    name: 'Dr. Zakir Husain',
    hookTitle: 'Facing Down an Armed Mob & 500 Varieties of Roses',
    text: 'During the bloody chaos of partition, Dr. Zakir Husain calmly stared down an armed mob at a railway station with zero fear. Later, as President, he transformed Rashtrapati Bhavan into a world-class botanical wonder, personally cultivating over five hundred rare varieties of roses.'
  },
  {
    id: '04_vv_giri',
    name: 'V. V. Giri',
    hookTitle: 'The Rebel Underdog Who Sparked the Conscience Vote',
    text: 'The ultimate political rebel! When the ruling party syndicate backed an official nominee in nineteen sixty-nine, V. V. Giri ran as a fearless independent underdog, triggering India’s famous conscience vote and staging the greatest upset in democratic history.'
  },
  {
    id: '05_fakhruddin_ali_ahmed',
    name: 'Fakhruddin Ali Ahmed',
    hookTitle: 'The Midnight Emergency Crossroads',
    text: 'An ace tennis champion and Cambridge barrister, Fakhruddin Ali Ahmed was thrust into the fiercest crossroads of modern Indian history when an emergency proclamation arrived at midnight, forever binding his name to the nation’s most intense constitutional crisis.'
  },
  {
    id: '06_neelam_sanjiva_reddy',
    name: 'Neelam Sanjiva Reddy',
    hookTitle: 'From Plowing Village Fields to Unanimous Triumph',
    text: 'After a heartbreaking political loss, he walked away from politics to plow his rural village fields. Eight years later, in a miracle never repeated in Indian history, every single political party united to elect Neelam Sanjiva Reddy completely unopposed!'
  },
  {
    id: '07_giani_zail_singh',
    name: 'Giani Zail Singh',
    hookTitle: 'The Historic Pocket Veto Protecting Citizen Privacy',
    text: 'When Parliament passed a controversial law allowing authorities to intercept anyone’s private letters, Giani Zail Singh struck back! He executed India’s first-ever pocket veto, slipping the bill into his desk drawer and refusing to sign it, single-handedly protecting citizen privacy.'
  },
  {
    id: '08_r_venkataraman',
    name: 'R. Venkataraman',
    hookTitle: 'Swearing in 4 Prime Ministers & The Emergency Lamp',
    text: 'Four Prime Ministers in four chaotic years! R. Venkataraman acted as the nation’s constitutional anchor, famously declaring: The President is like an emergency light—it clicks on only when the regular political power collapses!'
  },
  {
    id: '09_shankar_dayal_sharma',
    name: 'Dr. Shankar Dayal Sharma',
    hookTitle: 'Tears in Parliament & When a Foreign King Drove His Car',
    text: 'A profound Sanskrit scholar who wept openly in Parliament to defend democratic decorum. His global reverence was so immense that when he landed in Muscat, the Sultan of Oman broke all royal protocols by personally driving Dr. Sharma’s car!'
  },
  {
    id: '10_kr_narayanan',
    name: 'K. R. Narayanan',
    hookTitle: 'Barefoot Boy Who Stood in Line to Vote as President',
    text: 'As a barefoot village boy in Kerala, he walked miles to school because his family could not afford shoes. Decades later, K. R. Narayanan stood in a public queue to vote like an ordinary citizen, boldly returning government decrees to protect the Constitution.'
  },
  {
    id: '11_apj_abdul_kalam',
    name: 'Dr. A. P. J. Abdul Kalam',
    hookTitle: 'Inviting His Cobbler to Rashtrapati Bhavan & Missile Marvels',
    text: 'When Dr. Kalam took the oath as President, his special guests were not billionaires, but his childhood cobbler and a tiny lodge owner! The boy who sold newspapers in Rameswaram engineered India’s missile shield and won a billion hearts as the People’s President.'
  },
  {
    id: '12_pratibha_patil',
    name: 'Pratibha Devisingh Patil',
    hookTitle: 'Breaking the Sound Barrier in a Sukhoi-30 at Age 74',
    text: 'Breaking a sixty-year glass ceiling! At age seventy-four, Pratibha Patil strapped on a G-suit, climbed into the cockpit of a supersonic Sukhoi-30 combat fighter jet, and made world history as the first woman head of state to co-pilot Mach-speed combat aviation.'
  },
  {
    id: '13_pranab_mukherjee',
    name: 'Pranab Mukherjee',
    hookTitle: 'Photographic Memory & Iron Resolve on Terrorists',
    text: 'A photographic memory that could recall obscure budget numbers from thirty years ago without notes! Pranab Mukherjee rejected dozens of terrorist mercy petitions with an iron fist, and famously traded his presidential protocols to teach school kids on Teachers’ Day.'
  },
  {
    id: '14_ram_nath_kovind',
    name: 'Ram Nath Kovind',
    hookTitle: 'From a Burnt Mud Hut to Kneeling in Village Soil',
    text: 'He grew up in a thatched mud hut that burnt to the ground in a storm. Decades after fighting free court cases for the poorest citizens, Ram Nath Kovind arrived at his remote birthplace on a presidential train, kneeling to touch the sacred dust of his childhood.'
  },
  {
    id: '15_droupadi_murmu',
    name: 'Smt. Droupadi Murmu',
    hookTitle: 'From Heartbreaking Tragedy to India’s First Tribal President',
    text: 'After enduring the tragic loss of her two young sons and husband within just a few years, she converted her home into a free school. Rising from the deep forests of Mayurbhanj, Droupadi Murmu etched history as India’s first tribal President, embodying the unbreakable spirit of grassroots democracy!'
  }
];

// =========================================================================
// TTS SYNTHESIZER WORKER
// =========================================================================
async function synthesizeStoryVoiceover(item, index) {
  const filePath = path.join(AUDIO_DIR, `${item.id}.mp3`);

  if (!FORCE_OVERWRITE && fs.existsSync(filePath)) {
    console.log(`  ⏩ [${index + 1}/15] Already cached: ${item.id}.mp3`);
    return filePath;
  }

  if (!ELEVENLABS_KEY) {
    throw new Error('Missing ELEVENLABS_KEY in environment or script.');
  }

  console.log(`  🎙️ [${index + 1}/15] Generating Hook Story: ${item.name} (${item.hookTitle})...`);

  // Dramatic & High-Engagement Voice Settings
  const payload = {
    text: item.text,
    model_id: ELEVEN_MODEL_ID,
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.88,
      style: 0.22,
      use_speaker_boost: true
    }
  };

  let response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_KEY,
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.warn(`     ⚠️ Model ${ELEVEN_MODEL_ID} failed (Status ${response.status}). Retrying with eleven_turbo_v2_5...`);
    payload.model_id = 'eleven_turbo_v2_5';
    response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_KEY,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs Error (${response.status}): ${await response.text()}`);
    }
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(filePath, buffer);
  console.log(`     ✅ Saved Audio: assets/audio/${item.id}.mp3 (${(buffer.length / 1024).toFixed(1)} KB)`);
  return filePath;
}

// =========================================================================
// RUNNER
// =========================================================================
async function run() {
  await fs.promises.mkdir(AUDIO_DIR, { recursive: true });

  console.log('\n===============================================================');
  console.log(`🔥 Starting Hooky & Storytelling Voiceover Generation`);
  console.log(`⚡ Model: ${ELEVEN_MODEL_ID} (High Expressiveness & Drama)`);
  console.log(`📁 Destination: assets/audio/`);
  console.log('===============================================================\n');

  for (let i = 0; i < STORY_MANIFEST.length; i++) {
    const item = STORY_MANIFEST[i];
    await retry(() => synthesizeStoryVoiceover(item, i), 3, 2000);
    await sleep(700); // Friendly rate-limit delay
  }

  console.log('\n🎉 ALL 15 HOOKY PRESIDENT STORIES GENERATED SUCCESSFULLY!');
  console.log('👉 अब आप इन 15 फाइलों की ड्यूरेशन (Exact Seconds) चेक करके मुझे भेजें,');
  console.log('   फिर मैं आपके लिए बड़ा UI, SVG डूडल्स, स्पार्कल्स और माइंड-मैप वाला मेगा index.html बना दूँगा!\n');
}

run().catch(console.error);