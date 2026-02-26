const { createApp, ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

// ─── Utility ────────────────────────────────────────────────────────────────
function saveLocal(key, val) {
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch(e) {}
}
function loadLocal(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    try { return JSON.parse(v); } catch { return v; }
  } catch { return fallback; }
}
function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── WelcomeScreen ──────────────────────────────────────────────────────────
const WelcomeScreen = {
  emits: ['begin'],
  setup(_, { emit }) {
    const name = ref('');
    const showPillars = computed(() => name.value.trim().length >= 1);

    function begin() {
      if (!name.value.trim()) return;
      saveLocal('stillness_name', name.value.trim());
      saveLocal('stillness_onboarded', true);
      emit('begin', name.value.trim());
    }

    return { name, showPillars, begin };
  },
  template: `
    <div class="screen" style="background: linear-gradient(160deg, #F7F4F0 0%, #EDE8E1 100%); display:flex; align-items:center; justify-content:center; min-height:100%;">
      <div class="max-w" style="padding: 40px 24px; text-align:center; width:100%;">
        <div style="font-size: 48px; margin-bottom: 16px;">🌿</div>
        <h1 style="font-size: 3rem; color: var(--text-primary); margin-bottom: 8px;">Stillness</h1>
        <p style="color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 48px; font-style: italic;">
          A moment of calm, whenever you need it.
        </p>

        <div style="text-align: left; margin-bottom: 20px;">
          <label style="display:block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.08em; text-transform: uppercase;">Your name</label>
          <input class="input" v-model="name" placeholder="Enter your name..." @keyup.enter="begin" maxlength="32" />
        </div>

        <transition name="fade">
          <div v-if="showPillars" style="margin-bottom: 32px; text-align: left;">
            <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 16px;">Stillness offers three pathways to calm:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; cursor:default;">
                <span style="font-size:24px;">🌱</span>
                <div>
                  <div style="font-weight:500; font-size:0.95rem;">Grounding</div>
                  <div style="font-size:0.83rem; color:var(--text-secondary);">Anchor yourself in the present moment</div>
                </div>
              </div>
              <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; cursor:default;">
                <span style="font-size:24px;">🌬️</span>
                <div>
                  <div style="font-weight:500; font-size:0.95rem;">Breathwork</div>
                  <div style="font-size:0.83rem; color:var(--text-secondary);">Regulate your nervous system through breath</div>
                </div>
              </div>
              <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; cursor:default;">
                <span style="font-size:24px;">✨</span>
                <div>
                  <div style="font-weight:500; font-size:0.95rem;">Meditation</div>
                  <div style="font-size:0.83rem; color:var(--text-secondary);">Cultivate stillness and clarity of mind</div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <button class="btn btn-primary btn-full" @click="begin" :disabled="!name.trim()" style="font-size:1.05rem; padding: 16px;">
          Begin
        </button>
      </div>
    </div>
  `
};

// ─── HomeScreen ─────────────────────────────────────────────────────────────
const HomeScreen = {
  props: ['name', 'preferences'],
  emits: ['navigate'],
  setup(props, { emit }) {
    const greeting = computed(() => {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) return 'Good morning';
      if (h >= 12 && h < 17) return 'Good afternoon';
      if (h >= 17 && h < 21) return 'Good evening';
      return 'Good night';
    });

    const lastUsed = computed(() => {
      const p = props.preferences;
      if (!p || !p.lastScreen) return null;
      const map = {
        'grounding-senses': { label: '5-4-3-2-1 Senses', icon: '👁️', screen: 'grounding-senses' },
        'grounding-bodyscan': { label: 'Body Scan', icon: '🧘', screen: 'grounding-bodyscan' },
        'grounding-object': { label: 'Object Focus', icon: '🔍', screen: 'grounding-object' },
        'grounding-feet': { label: 'Grounding Feet', icon: '🦶', screen: 'grounding-feet' },
        'grounding-leaves': { label: 'Leaves on Stream', icon: '🍃', screen: 'grounding-leaves' },
        'breathwork-wimhof': { label: 'Wim Hof Breathing', icon: '💨', screen: 'breathwork-wimhof' },
        'breathwork-box': { label: 'Box Breathing', icon: '⬜', screen: 'breathwork-box' },
        'breathwork-478': { label: '4-7-8 Breathing', icon: '🌙', screen: 'breathwork-478' },
        'meditation-session': { label: 'Meditation', icon: '✨', screen: 'meditation-hub' },
      };
      return map[p.lastScreen] || null;
    });

    return { greeting, lastUsed, emit };
  },
  template: `
    <div class="screen">
      <div class="max-w" style="padding: 40px 24px 120px;">
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 2rem; line-height: 1.3;">{{ greeting }},<br/>{{ name }}</h1>
          <p style="color: var(--text-secondary); margin-top: 8px; font-size: 1rem;">What would you like to explore?</p>
        </div>

        <div v-if="lastUsed" style="margin-bottom: 28px;">
          <p class="section-label" style="margin-bottom: 10px;">Continue where you left off</p>
          <div class="card" @click="emit('navigate', lastUsed.screen)" style="display:flex; align-items:center; gap:12px; background: var(--bg-secondary);">
            <span style="font-size:24px;">{{ lastUsed.icon }}</span>
            <div style="flex:1;">
              <div style="font-weight:500; font-size:0.92rem;">{{ lastUsed.label }}</div>
              <div style="font-size:0.8rem; color:var(--text-secondary);">Tap to resume</div>
            </div>
            <span style="color:var(--text-secondary); font-size:18px;">›</span>
          </div>
        </div>

        <p class="section-label" style="margin-bottom: 12px;">Pillars</p>
        <div style="display:flex; flex-direction:column; gap: 14px;">
          <div class="card" @click="emit('navigate', 'grounding-hub')" style="display:flex; align-items:center; gap:16px;">
            <div style="width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#c8dbc0,#a8c4a0); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">🌱</div>
            <div style="flex:1;">
              <h3 style="font-size:1.2rem; margin-bottom:4px;">Grounding</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary);">Anchor yourself in the present moment through your senses and body.</p>
            </div>
            <span style="color:var(--text-secondary); font-size:20px;">›</span>
          </div>
          <div class="card" @click="emit('navigate', 'breathwork-hub')" style="display:flex; align-items:center; gap:16px;">
            <div style="width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#b8cdd5,#8BADB8); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">🌬️</div>
            <div style="flex:1;">
              <h3 style="font-size:1.2rem; margin-bottom:4px;">Breathwork</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary);">Regulate your nervous system through intentional breathing techniques.</p>
            </div>
            <span style="color:var(--text-secondary); font-size:20px;">›</span>
          </div>
          <div class="card" @click="emit('navigate', 'meditation-hub')" style="display:flex; align-items:center; gap:16px;">
            <div style="width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#ddd0c0,#C4A882); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">✨</div>
            <div style="flex:1;">
              <h3 style="font-size:1.2rem; margin-bottom:4px;">Meditation</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary);">Cultivate stillness, clarity, and awareness of the present.</p>
            </div>
            <span style="color:var(--text-secondary); font-size:20px;">›</span>
          </div>
        </div>
      </div>
    </div>
  `
};

// ─── GroundingHub ────────────────────────────────────────────────────────────
const GroundingHub = {
  emits: ['navigate'],
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate', 'home')">←</button>
        <h2>Grounding</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 100px;">
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:24px; margin-top:-4px;">Choose an exercise to anchor yourself in the present moment.</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="card" @click="$emit('navigate','grounding-senses')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">👁️</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">5-4-3-2-1 Senses</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Use all five senses to ground yourself in this moment</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','grounding-bodyscan')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🧘</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Body Scan</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Slowly bring awareness through each part of your body</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','grounding-object')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🔍</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Mindful Object Focus</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Focus intently on one object to quiet a busy mind</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','grounding-feet')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🦶</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Grounding Through Feet</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Connect with the earth beneath you</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','grounding-leaves')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🍃</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Leaves on a Stream</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Visualise thoughts floating gently downstream</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
        </div>
      </div>
    </div>
  `
};

// ─── SensesExercise ──────────────────────────────────────────────────────────
const SensesExercise = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const steps = [
      { count: 5, sense: 'SEE', icon: '👁️', instruction: 'Look around and name 5 things you can see. Take your time with each one — notice their colour, shape, and detail.' },
      { count: 4, sense: 'TOUCH', icon: '✋', instruction: 'Notice 4 things you can physically feel — the texture of your clothes, the temperature of the air, the surface beneath you.' },
      { count: 3, sense: 'HEAR', icon: '👂', instruction: 'Listen carefully for 3 sounds. They might be nearby or distant. Notice each sound without judgement.' },
      { count: 2, sense: 'SMELL', icon: '👃', instruction: 'Find 2 things you can smell. Maybe your own skin, the air, or something nearby. Breathe gently.' },
      { count: 1, sense: 'TASTE', icon: '👅', instruction: 'Notice 1 taste in your mouth right now. Simply observe whatever is present.' },
    ];
    const step = ref(0);
    const visible = ref(true);

    function next() {
      if (step.value < steps.length - 1) {
        visible.value = false;
        setTimeout(() => { step.value++; visible.value = true; }, 300);
      } else {
        emit('navigate', 'grounding-hub');
      }
    }

    const current = computed(() => steps[step.value]);

    return { steps, step, visible, next, current };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','grounding-hub')">←</button>
        <h2>5-4-3-2-1 Senses</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px;">
          <div class="progress-bar" style="flex:1;"><div class="progress-bar-fill" :style="{width: ((step+1)/steps.length*100)+'%'}"></div></div>
          <span style="font-size:0.8rem; color:var(--text-secondary); white-space:nowrap;">{{ step+1 }} / {{ steps.length }}</span>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="visible" :key="step" style="text-align:center;">
            <div style="font-size:64px; margin-bottom:16px;">{{ current.icon }}</div>
            <div style="font-size: 5rem; font-family: 'Cormorant Garamond', serif; font-weight:300; color:var(--accent); line-height:1; margin-bottom:8px;">{{ current.count }}</div>
            <div style="font-size: 1rem; letter-spacing: 0.15em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:32px;">things you can {{ current.sense }}</div>
            <p style="color:var(--text-primary); font-size:1rem; line-height:1.7; max-width:340px; margin:0 auto 40px;">{{ current.instruction }}</p>
            <button class="btn btn-primary btn-full" @click="next" style="max-width:300px; margin: 0 auto; display:block;">
              {{ step === steps.length - 1 ? 'Complete' : 'Next' }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  `
};

// ─── BodyScan ────────────────────────────────────────────────────────────────
const BodyScan = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const zones = [
      { label: 'Scalp & Forehead', text: 'Notice your scalp and forehead. Let any tension there soften and release.', y: 5 },
      { label: 'Eyes & Face', text: 'Bring awareness to your eyes, cheeks, and jaw. Allow your face to relax completely.', y: 13 },
      { label: 'Jaw & Neck', text: 'Feel your jaw and neck. Notice if you\'re holding any tension — let it go with each breath.', y: 22 },
      { label: 'Shoulders & Chest', text: 'Become aware of your shoulders. Let them drop. Feel your chest rise and fall with each breath.', y: 34 },
      { label: 'Arms & Hands', text: 'Notice your arms and hands. Feel the weight of them. Are they warm or cool? Heavy or light?', y: 50 },
      { label: 'Abdomen', text: 'Bring awareness to your belly. Feel it expand on the inhale and soften on the exhale.', y: 57 },
      { label: 'Lower Back', text: 'Notice your lower back. If there\'s any discomfort, acknowledge it gently without resistance.', y: 63 },
      { label: 'Hips & Pelvis', text: 'Become aware of your hips. Feel the weight of your body being supported.', y: 70 },
      { label: 'Legs & Knees', text: 'Notice your thighs, knees, and calves. Feel the texture of whatever they\'re resting on.', y: 82 },
      { label: 'Feet & Toes', text: 'Finally, bring your attention to your feet and toes. Feel them completely. You are here, present and grounded.', y: 95 },
    ];

    const totalDuration = 240; // 4 minutes
    const zoneDuration = Math.floor(totalDuration / zones.length);
    const currentZone = ref(0);
    const isPaused = ref(false);
    const elapsed = ref(0);
    let interval = null;

    function start() {
      interval = setInterval(() => {
        if (!isPaused.value) {
          elapsed.value++;
          const newZone = Math.min(Math.floor(elapsed.value / zoneDuration), zones.length - 1);
          currentZone.value = newZone;
          if (elapsed.value >= totalDuration) {
            clearInterval(interval);
          }
        }
      }, 1000);
    }

    onMounted(start);
    onUnmounted(() => clearInterval(interval));

    const progress = computed(() => Math.min((elapsed.value / totalDuration) * 100, 100));
    const highlightY = computed(() => zones[currentZone.value].y);

    return { zones, currentZone, isPaused, progress, highlightY, elapsed, totalDuration };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','grounding-hub')">←</button>
        <h2>Body Scan</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px;">
          <div class="progress-bar" style="flex:1;"><div class="progress-bar-fill" :style="{width: progress+'%'}"></div></div>
          <span style="font-size:0.8rem; color:var(--text-secondary); white-space:nowrap;">{{ Math.floor(elapsed/60) }}:{{ String(elapsed%60).padStart(2,'0') }}</span>
        </div>

        <div style="display:flex; gap:24px; align-items:flex-start;">
          <!-- SVG silhouette -->
          <div style="flex-shrink:0; position:relative; width:100px; height:220px;">
            <svg viewBox="0 0 100 220" width="100" height="220" style="position:absolute; top:0; left:0;">
              <!-- Body outline -->
              <ellipse cx="50" cy="18" rx="13" ry="16" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="30" y="33" width="40" height="55" rx="10" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="16" y="35" width="15" height="45" rx="7" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="69" y="35" width="15" height="45" rx="7" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="32" y="86" width="16" height="80" rx="8" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="52" y="86" width="16" height="80" rx="8" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="29" y="162" width="18" height="30" rx="7" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <rect x="51" y="162" width="18" height="30" rx="7" fill="var(--bg-secondary)" stroke="var(--highlight)" stroke-width="1.5"/>
              <!-- Glow highlight -->
              <ellipse
                cx="50"
                :cy="highlightY * 2.2"
                rx="30"
                ry="14"
                fill="var(--accent)"
                opacity="0.25"
                class="body-scan-highlight"
              />
            </svg>
          </div>

          <!-- Text -->
          <div style="flex:1; padding-top:8px;">
            <transition name="fade" mode="out-in">
              <div :key="currentZone">
                <div class="section-label" style="margin-bottom:6px;">{{ zones[currentZone].label }}</div>
                <p style="font-size:0.95rem; line-height:1.75; color:var(--text-primary);">{{ zones[currentZone].text }}</p>
              </div>
            </transition>
          </div>
        </div>

        <button class="btn btn-secondary btn-full" style="margin-top:32px;" @click="isPaused = !isPaused">
          {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
        </button>
      </div>
    </div>
  `
};

// ─── ObjectFocus ──────────────────────────────────────────────────────────────
const ObjectFocus = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const prompts = [
      'What does it feel like to hold?',
      'What colours can you see?',
      'Is it warm or cool?',
      'What details haven\'t you noticed before?',
      'Notice its texture closely',
      'How heavy does it feel?',
    ];
    const duration = 120;
    const remaining = ref(duration);
    const promptIndex = ref(0);
    let interval = null;

    onMounted(() => {
      interval = setInterval(() => {
        if (remaining.value > 0) {
          remaining.value--;
          const elapsed = duration - remaining.value;
          promptIndex.value = Math.floor(elapsed / 20) % prompts.length;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    });
    onUnmounted(() => clearInterval(interval));

    const done = computed(() => remaining.value === 0);

    return { prompts, remaining, promptIndex, done, fmtTime };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','grounding-hub')">←</button>
        <h2>Object Focus</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px; text-align:center;">
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:40px;">Pick up any small object nearby and focus on it completely.</p>

        <div v-if="!done">
          <div style="font-size:4rem; font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--accent); margin-bottom:8px; letter-spacing:0.05em;">
            {{ fmtTime(remaining) }}
          </div>
          <div style="width:60px; height:3px; background:var(--accent); border-radius:2px; margin: 0 auto 36px;"></div>

          <transition name="fade" mode="out-in">
            <p :key="promptIndex" style="font-size:1.2rem; font-family:'Cormorant Garamond',serif; font-style:italic; color:var(--text-primary); line-height:1.5; max-width:280px; margin:0 auto 48px;">
              "{{ prompts[promptIndex] }}"
            </p>
          </transition>

          <div class="progress-bar" style="max-width:280px; margin:0 auto;">
            <div class="progress-bar-fill" :style="{width: ((120-remaining)/120*100)+'%'}"></div>
          </div>
        </div>

        <div v-else style="text-align:center;">
          <div class="completion-icon">🔍</div>
          <h2 style="font-size:1.8rem; margin-top:16px; margin-bottom:8px;">Well done</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px;">You've spent 2 minutes in mindful focus.</p>
          <button class="btn btn-primary" @click="$emit('navigate','grounding-hub')">Return</button>
        </div>
      </div>
    </div>
  `
};

// ─── GroundingFeet ────────────────────────────────────────────────────────────
const GroundingFeet = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const prompts = [
      'Feel the weight of your feet on the ground',
      'Notice the pressure points beneath you',
      'Is the floor warm or cool beneath you?',
      'Feel the edges of your feet',
      'Wiggle your toes gently',
      'Return to stillness',
    ];
    const duration = 150; // 2.5 min
    const remaining = ref(duration);
    const promptIndex = ref(0);
    let interval = null;

    onMounted(() => {
      interval = setInterval(() => {
        if (remaining.value > 0) {
          remaining.value--;
          const elapsed = duration - remaining.value;
          promptIndex.value = Math.floor(elapsed / 25) % prompts.length;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    });
    onUnmounted(() => clearInterval(interval));

    const done = computed(() => remaining.value === 0);
    return { prompts, remaining, promptIndex, done, fmtTime };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','grounding-hub')">←</button>
        <h2>Grounding Through Feet</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px; text-align:center;">
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:40px;">Plant your feet flat on the floor. Feel the connection with the earth.</p>

        <div v-if="!done">
          <!-- Pulse circle -->
          <div style="display:flex; align-items:center; justify-content:center; margin-bottom:40px;">
            <div class="pulse-circle" style="width:160px; height:160px; border-radius:50%; background:radial-gradient(circle, rgba(123,160,138,0.3) 0%, rgba(123,160,138,0.08) 100%); border:2px solid rgba(123,160,138,0.4); display:flex; align-items:center; justify-content:center;">
              <span style="font-size:48px;">🦶</span>
            </div>
          </div>

          <div style="font-size:2.5rem; font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--accent); margin-bottom:24px;">
            {{ fmtTime(remaining) }}
          </div>

          <transition name="fade" mode="out-in">
            <p :key="promptIndex" style="font-size:1.1rem; font-family:'Cormorant Garamond',serif; font-style:italic; color:var(--text-primary); line-height:1.6; max-width:300px; margin:0 auto 40px;">
              "{{ prompts[promptIndex] }}"
            </p>
          </transition>

          <div class="progress-bar" style="max-width:280px; margin:0 auto;">
            <div class="progress-bar-fill" :style="{width: ((150-remaining)/150*100)+'%'}"></div>
          </div>
        </div>

        <div v-else style="text-align:center;">
          <div class="completion-icon">🦶</div>
          <h2 style="font-size:1.8rem; margin-top:16px; margin-bottom:8px;">Grounded</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px;">You've completed your grounding session.</p>
          <button class="btn btn-primary" @click="$emit('navigate','grounding-hub')">Return</button>
        </div>
      </div>
    </div>
  `
};

// ─── LeavesOnStream ───────────────────────────────────────────────────────────
const LeavesOnStream = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const leaves = ref([]);
    const elapsed = ref(0);
    let interval = null;
    let leafId = 0;

    onMounted(() => {
      interval = setInterval(() => { elapsed.value++; }, 1000);
    });
    onUnmounted(() => clearInterval(interval));

    function addLeaf(e) {
      if (leaves.value.length >= 20) {
        leaves.value.shift();
      }
      const rect = e.currentTarget ? e.currentTarget.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const yPct = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      const dur = (12 + Math.random() * 10).toFixed(1);
      const size = 32 + Math.floor(Math.random() * 20);
      const rotation = Math.floor(Math.random() * 360);
      const green = `hsl(${110 + Math.floor(Math.random()*40)}, ${50+Math.floor(Math.random()*30)}%, ${30+Math.floor(Math.random()*20)}%)`;
      leaves.value.push({ id: leafId++, yPct, dur, size, rotation, color: green });
    }

    function endSession() {
      clearInterval(interval);
      emit('navigate', 'grounding-hub');
    }

    return { leaves, elapsed, addLeaf, endSession, fmtTime };
  },
  template: `
    <div class="stream-container" @click="addLeaf">
      <div class="stream-ripple"></div>

      <!-- Water lines -->
      <div v-for="i in 8" :key="i" :style="{
        position:'absolute',
        top: (i * 12 + 2) + '%',
        left:0, right:0,
        height:'1px',
        background:'rgba(255,255,255,0.05)',
        animation: 'streamFlow ' + (6+i) + 's linear infinite'
      }"></div>

      <!-- Leaves -->
      <svg v-for="leaf in leaves" :key="leaf.id"
        class="leaf"
        :style="{
          right: '-80px',
          top: leaf.yPct + '%',
          animationDuration: leaf.dur + 's',
          width: leaf.size + 'px',
          height: leaf.size + 'px',
        }"
        :viewBox="'0 0 40 40'"
      >
        <ellipse cx="20" cy="20" rx="16" ry="10" :fill="leaf.color" :transform="'rotate('+leaf.rotation+',20,20)'" opacity="0.85"/>
        <line x1="4" y1="20" x2="36" y2="20" stroke="rgba(0,0,0,0.2)" stroke-width="1" :transform="'rotate('+leaf.rotation+',20,20)'"/>
      </svg>

      <!-- UI overlay -->
      <div style="position:absolute; top:0; left:0; right:0; padding:20px; pointer-events:none;">
        <div style="max-width:480px; margin:0 auto; display:flex; align-items:center; justify-content:space-between;">
          <div style="background:rgba(0,0,0,0.4); border-radius:50px; padding:8px 16px; backdrop-filter:blur(4px);">
            <span style="color:rgba(255,255,255,0.9); font-size:0.85rem;">{{ fmtTime(elapsed) }}</span>
          </div>
          <div style="background:rgba(0,0,0,0.4); border-radius:50px; padding:8px 16px; backdrop-filter:blur(4px);">
            <span style="color:rgba(255,255,255,0.7); font-size:0.8rem;">🍃 {{ leaves.length }} thoughts released</span>
          </div>
        </div>
      </div>

      <div style="position:absolute; bottom:0; left:0; right:0; padding:32px 24px; pointer-events:none;">
        <div style="max-width:480px; margin:0 auto; text-align:center;">
          <p style="color:rgba(255,255,255,0.7); font-size:0.9rem; margin-bottom:20px; font-style:italic;">
            Each time a thought arises, tap anywhere to place it on a leaf
          </p>
          <button class="btn btn-secondary" @click.stop="endSession" style="pointer-events:all; background:rgba(0,0,0,0.5); color:white; border:1px solid rgba(255,255,255,0.3); backdrop-filter:blur(4px);">
            End Session
          </button>
        </div>
      </div>
    </div>
  `
};

// ─── BreathworkHub ────────────────────────────────────────────────────────────
const BreathworkHub = {
  emits: ['navigate'],
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','home')">←</button>
        <h2>Breathwork</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 100px;">
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:24px; margin-top:-4px;">Choose a breathing technique to calm your nervous system.</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="card" @click="$emit('navigate','breathwork-wimhof')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">💨</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Wim Hof Breathing</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Energising power breath cycles with breath retention</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','breathwork-box')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">⬜</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">Box Breathing</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Equal phases of inhale, hold, exhale, hold for balance</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
          <div class="card" @click="$emit('navigate','breathwork-478')" style="display:flex; align-items:center; gap:14px;">
            <span style="font-size:28px;">🌙</span>
            <div style="flex:1;">
              <div style="font-weight:500; margin-bottom:3px;">4-7-8 Breathing</div>
              <div style="font-size:0.82rem; color:var(--text-secondary);">Excellent for sleep and anxiety. Inhale 4, hold 7, exhale 8.</div>
            </div>
            <span style="color:var(--text-secondary);">›</span>
          </div>
        </div>
      </div>
    </div>
  `
};

// ─── WimHofBreathing ──────────────────────────────────────────────────────────
const WimHofBreathing = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const disclaimerDismissed = ref(false);
    const totalRounds = ref(3);
    const phase = ref('idle'); // idle, power, retention, recovery, rest, complete
    const currentRound = ref(1);
    const breathCount = ref(0);
    const retentionSeconds = ref(0);
    const recoverySeconds = ref(15);
    const restSeconds = ref(5);
    const circleScale = ref(1);
    const showStop = ref(false);

    let timer = null;
    let breathTimer = null;

    function startSession() {
      currentRound.value = 1;
      startPowerBreaths();
    }

    function startPowerBreaths() {
      phase.value = 'power';
      breathCount.value = 0;
      let expanding = true;
      circleScale.value = 0.7;

      breathTimer = setInterval(() => {
        expanding = !expanding;
        circleScale.value = expanding ? 1.3 : 0.7;
        if (!expanding) {
          breathCount.value++;
          if (breathCount.value >= 30) {
            clearInterval(breathTimer);
            setTimeout(startRetention, 800);
          }
        }
      }, 1000);
    }

    function startRetention() {
      phase.value = 'retention';
      circleScale.value = 0.6;
      retentionSeconds.value = 0;
      timer = setInterval(() => { retentionSeconds.value++; }, 1000);
    }

    function breatheIn() {
      if (phase.value !== 'retention') return;
      clearInterval(timer);
      startRecovery();
    }

    function startRecovery() {
      phase.value = 'recovery';
      circleScale.value = 1.4;
      recoverySeconds.value = 15;
      timer = setInterval(() => {
        recoverySeconds.value--;
        if (recoverySeconds.value <= 0) {
          clearInterval(timer);
          setTimeout(afterRecovery, 1000);
        }
      }, 1000);
    }

    function afterRecovery() {
      if (currentRound.value >= totalRounds.value) {
        phase.value = 'complete';
        circleScale.value = 1;
      } else {
        phase.value = 'rest';
        circleScale.value = 1;
        restSeconds.value = 5;
        timer = setInterval(() => {
          restSeconds.value--;
          if (restSeconds.value <= 0) {
            clearInterval(timer);
            currentRound.value++;
            startPowerBreaths();
          }
        }, 1000);
      }
    }

    function stopSession() {
      clearInterval(timer);
      clearInterval(breathTimer);
      emit('navigate', 'breathwork-hub');
    }

    onUnmounted(() => { clearInterval(timer); clearInterval(breathTimer); });

    const circleStyle = computed(() => ({
      transform: `scale(${circleScale.value})`,
      transition: phase.value === 'power' ? 'transform 0.9s ease-in-out' : 'transform 1.5s ease-in-out',
    }));

    function changeRounds(d) {
      totalRounds.value = Math.max(1, Math.min(5, totalRounds.value + d));
    }

    return {
      disclaimerDismissed, totalRounds, phase, currentRound, breathCount,
      retentionSeconds, recoverySeconds, restSeconds, circleStyle,
      startSession, breatheIn, stopSession, changeRounds
    };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="stopSession">←</button>
        <h2>Wim Hof Breathing</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px; text-align:center;">

        <!-- Disclaimer -->
        <div v-if="!disclaimerDismissed" style="background:#fff8f0; border:1.5px solid var(--accent-warm); border-radius:16px; padding:20px; text-align:left; margin-bottom:24px;">
          <div style="font-weight:500; color:var(--accent-warm); margin-bottom:8px;">⚠️ Safety Notice</div>
          <p style="font-size:0.88rem; color:var(--text-primary); line-height:1.6; margin-bottom:12px;">
            Never practice Wim Hof breathing in water, while driving, or standing. You may feel lightheaded — this is normal. Stop if you feel pain or extreme discomfort. Not recommended during pregnancy or if you have epilepsy, high blood pressure, or cardiovascular issues.
          </p>
          <button class="btn btn-secondary" style="width:100%;" @click="disclaimerDismissed = true">I understand, continue</button>
        </div>

        <!-- Config (idle) -->
        <div v-if="disclaimerDismissed && phase === 'idle'">
          <p style="color:var(--text-secondary); margin-bottom:32px; font-size:0.9rem;">Perform power breaths, then hold, then recover. Each round cleanses and energises.</p>
          <div style="margin-bottom:40px;">
            <p style="font-weight:500; margin-bottom:16px;">Number of rounds</p>
            <div style="display:flex; align-items:center; justify-content:center; gap:24px;">
              <button class="btn btn-secondary" style="width:52px; height:52px; border-radius:50%; font-size:24px; padding:0;" @click="changeRounds(-1)">−</button>
              <span style="font-size:3rem; font-family:'Cormorant Garamond',serif; color:var(--accent); min-width:60px; display:inline-block;">{{ totalRounds }}</span>
              <button class="btn btn-secondary" style="width:52px; height:52px; border-radius:50%; font-size:24px; padding:0;" @click="changeRounds(1)">+</button>
            </div>
          </div>
          <button class="btn btn-primary btn-full" @click="startSession">Begin Session</button>
        </div>

        <!-- Power Breaths -->
        <div v-if="phase === 'power'" style="padding-top:16px;">
          <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:4px; letter-spacing:0.1em; text-transform:uppercase;">Round {{ currentRound }} of {{ totalRounds }}</div>
          <h3 style="font-size:1.4rem; margin-bottom:24px; color:var(--accent-breathe);">Power Breaths</h3>
          <div style="display:flex; align-items:center; justify-content:center; height:220px;">
            <div class="breath-circle" :style="circleStyle" style="background:radial-gradient(circle, var(--accent-breathe) 0%, rgba(139,173,184,0.25) 100%);"></div>
          </div>
          <div style="font-size:3rem; font-family:'Cormorant Garamond',serif; color:var(--accent); margin:16px 0 4px;">{{ breathCount }} / 30</div>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Breathe in fully as it expands, release as it contracts</p>
          <button class="btn btn-ghost" style="margin-top:32px;" @click="stopSession">Stop</button>
        </div>

        <!-- Retention Hold -->
        <div v-if="phase === 'retention'" style="padding-top:16px;">
          <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:4px; letter-spacing:0.1em; text-transform:uppercase;">Round {{ currentRound }} of {{ totalRounds }}</div>
          <h3 style="font-size:1.4rem; margin-bottom:24px; color:var(--accent);">Exhale & Hold</h3>
          <div style="display:flex; align-items:center; justify-content:center; height:220px;">
            <div class="breath-circle" :style="circleStyle" style="background:radial-gradient(circle, rgba(123,160,138,0.4) 0%, rgba(123,160,138,0.1) 100%);"></div>
          </div>
          <div style="font-size:3rem; font-family:'Cormorant Garamond',serif; color:var(--accent); margin:16px 0 4px;">{{ retentionSeconds }}s</div>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:28px;">Breathe out and hold. Tap when you need to breathe.</p>
          <button class="btn btn-primary btn-full" @click="breatheIn" style="max-width:280px; margin:0 auto; display:block;">Breathe In</button>
          <button class="btn btn-ghost" style="margin-top:12px;" @click="stopSession">Stop</button>
        </div>

        <!-- Recovery -->
        <div v-if="phase === 'recovery'" style="padding-top:16px;">
          <h3 style="font-size:1.4rem; margin-bottom:24px; color:var(--accent-warm);">Recovery Breath</h3>
          <div style="display:flex; align-items:center; justify-content:center; height:220px;">
            <div class="breath-circle" :style="circleStyle" style="background:radial-gradient(circle, var(--accent-warm) 0%, rgba(196,168,130,0.2) 100%);"></div>
          </div>
          <div style="font-size:3rem; font-family:'Cormorant Garamond',serif; color:var(--accent-warm); margin:16px 0 4px;">{{ recoverySeconds }}s</div>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Deep inhale — hold for 15 seconds, then exhale gently</p>
        </div>

        <!-- Rest between rounds -->
        <div v-if="phase === 'rest'" style="padding-top:40px;">
          <h3 style="font-size:1.6rem; margin-bottom:12px;">Round {{ currentRound - 1 }} complete</h3>
          <p style="color:var(--text-secondary); margin-bottom:24px;">Rest a moment...</p>
          <div style="font-size:2.5rem; font-family:'Cormorant Garamond',serif; color:var(--accent);">{{ restSeconds }}</div>
        </div>

        <!-- Complete -->
        <div v-if="phase === 'complete'" style="padding-top:40px; text-align:center;">
          <div class="completion-icon">💨</div>
          <h2 style="font-size:1.8rem; margin-top:16px; margin-bottom:8px;">Session Complete</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px;">You completed {{ totalRounds }} round{{ totalRounds > 1 ? 's' : '' }} of Wim Hof breathing.</p>
          <button class="btn btn-primary" @click="stopSession">Return</button>
        </div>
      </div>
    </div>
  `
};

// ─── BoxBreathing ─────────────────────────────────────────────────────────────
const BoxBreathing = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const count = ref(4);
    const phase = ref('idle'); // idle, IN, HOLD_IN, OUT, HOLD_OUT, done
    const phaseLabel = ref('');
    const countdown = ref(0);
    const cycles = ref(0);
    const totalMinutes = ref(4);
    const elapsed = ref(0);
    const dotPos = ref({ top: -8, left: -8 }); // relative to 200x200 box
    let phaseTimer = null;
    let sessionTimer = null;

    const phases = ['IN', 'HOLD_IN', 'OUT', 'HOLD_OUT'];
    const phaseNames = { IN: 'Inhale', HOLD_IN: 'Hold', OUT: 'Exhale', HOLD_OUT: 'Hold' };

    // Dot corners (top-left, top-right, bottom-right, bottom-left)
    // Each phase: dot moves along one side
    // Phase IN: top left → top right
    // Phase HOLD_IN: top right → bottom right
    // Phase OUT: bottom right → bottom left
    // Phase HOLD_OUT: bottom left → top left
    const dotTargets = {
      IN: { top: -8, left: 192 },
      HOLD_IN: { top: 192, left: 192 },
      OUT: { top: 192, left: -8 },
      HOLD_OUT: { top: -8, left: -8 },
    };
    const dotStart = {
      IN: { top: -8, left: -8 },
      HOLD_IN: { top: -8, left: 192 },
      OUT: { top: 192, left: 192 },
      HOLD_OUT: { top: 192, left: -8 },
    };

    let phaseIndex = 0;

    function startSession() {
      phase.value = 'IN';
      phaseIndex = 0;
      cycles.value = 0;
      elapsed.value = 0;
      runPhase();
      sessionTimer = setInterval(() => {
        elapsed.value++;
        if (elapsed.value >= totalMinutes.value * 60) {
          finishSession();
        }
      }, 1000);
    }

    function runPhase() {
      const p = phases[phaseIndex];
      phase.value = p;
      phaseLabel.value = phaseNames[p];
      countdown.value = count.value;
      dotPos.value = { ...dotStart[p] };

      // Animate dot to target
      setTimeout(() => { dotPos.value = { ...dotTargets[p] }; }, 50);

      phaseTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(phaseTimer);
          phaseIndex = (phaseIndex + 1) % phases.length;
          if (phaseIndex === 0) cycles.value++;
          if (phase.value !== 'done') runPhase();
        }
      }, 1000);
    }

    function finishSession() {
      clearInterval(phaseTimer);
      clearInterval(sessionTimer);
      phase.value = 'done';
    }

    function stopSession() {
      clearInterval(phaseTimer);
      clearInterval(sessionTimer);
      emit('navigate', 'breathwork-hub');
    }

    onUnmounted(() => { clearInterval(phaseTimer); clearInterval(sessionTimer); });

    const dotStyle = computed(() => ({
      top: dotPos.value.top + 'px',
      left: dotPos.value.left + 'px',
      transition: `top ${count.value}s linear, left ${count.value}s linear`,
    }));

    const phaseColor = computed(() => {
      const map = { IN: 'var(--accent)', HOLD_IN: 'var(--accent-warm)', OUT: 'var(--accent-breathe)', HOLD_OUT: 'var(--highlight)' };
      return map[phase.value] || 'var(--accent)';
    });

    const remaining = computed(() => Math.max(0, totalMinutes.value * 60 - elapsed.value));

    return { count, phase, phaseLabel, countdown, cycles, totalMinutes, dotStyle, phaseColor, remaining, startSession, stopSession, fmtTime };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="stopSession">←</button>
        <h2>Box Breathing</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px; text-align:center;">

        <div v-if="phase === 'idle'">
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:32px;">Equal phases of inhale, hold, exhale, hold to create balance and calm.</p>

          <div style="margin-bottom:28px;">
            <p style="font-weight:500; margin-bottom:12px;">Count per phase</p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button v-for="c in [4,5,6]" :key="c" class="btn" :class="count===c ? 'btn-primary' : 'btn-secondary'" @click="count=c" style="width:72px; font-size:1.1rem;">{{ c }}</button>
            </div>
          </div>

          <div style="margin-bottom:40px;">
            <p style="font-weight:500; margin-bottom:12px;">Duration</p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button v-for="m in [4,8,12]" :key="m" class="btn" :class="totalMinutes===m ? 'btn-primary' : 'btn-secondary'" @click="totalMinutes=m" style="width:80px; font-size:0.95rem;">{{ m }} min</button>
            </div>
          </div>

          <button class="btn btn-primary btn-full" @click="startSession">Begin</button>
        </div>

        <div v-else-if="phase === 'done'" style="padding-top:40px;">
          <div class="completion-icon">⬜</div>
          <h2 style="font-size:1.8rem; margin-top:16px; margin-bottom:8px;">Session Complete</h2>
          <p style="color:var(--text-secondary); margin-bottom:8px;">{{ cycles }} cycles completed</p>
          <p style="color:var(--text-secondary); margin-bottom:32px; font-size:0.9rem;">{{ totalMinutes }} minute session</p>
          <button class="btn btn-primary" @click="stopSession">Return</button>
        </div>

        <div v-else style="padding-top:8px;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-secondary); margin-bottom:24px;">
            <span>Cycle {{ cycles + 1 }}</span>
            <span>{{ fmtTime(remaining) }} remaining</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:center; margin-bottom:28px;">
            <div class="box-square">
              <div class="box-dot" :style="dotStyle"></div>
            </div>
          </div>

          <div style="font-size:2rem; letter-spacing:0.08em; font-weight:500; margin-bottom:6px;" :style="{color: phaseColor}">{{ phaseLabel }}</div>
          <div style="font-size:4rem; font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--text-primary); margin-bottom:8px;">{{ countdown }}</div>

          <button class="btn btn-ghost" style="margin-top:24px;" @click="stopSession">Stop</button>
        </div>
      </div>
    </div>
  `
};

// ─── FourSevenEight ────────────────────────────────────────────────────────────
const FourSevenEight = {
  emits: ['navigate'],
  setup(_, { emit }) {
    const targetCycles = ref(4);
    const phase = ref('idle'); // idle, inhale, hold, exhale, rest, done
    const countdown = ref(0);
    const cycle = ref(0);
    const blobAnimating = ref(false);

    const phaseConfig = { inhale: 4, hold: 7, exhale: 8 };
    const phases = ['inhale', 'hold', 'exhale'];
    let phaseIndex = 0;
    let timer = null;

    const blobStyle = computed(() => {
      if (phase.value === 'inhale') return { transform: 'scale(1.35)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', background: 'radial-gradient(135deg, var(--accent-breathe), var(--accent))' };
      if (phase.value === 'hold') return { transform: 'scale(1.35)', borderRadius: '50% 50% 50% 50%', background: 'radial-gradient(135deg, var(--accent-warm), var(--accent-breathe))' };
      if (phase.value === 'exhale') return { transform: 'scale(0.75)', borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', background: 'radial-gradient(135deg, var(--accent), var(--accent-breathe))' };
      return { transform: 'scale(1)', borderRadius: '50%', background: 'var(--bg-secondary)' };
    });

    const phaseLabel = computed(() => {
      const map = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', rest: 'Rest', done: '' };
      return map[phase.value] || '';
    });

    const phaseColor = computed(() => {
      const map = { inhale: 'var(--accent-breathe)', hold: 'var(--accent-warm)', exhale: 'var(--accent)' };
      return map[phase.value] || 'var(--text-primary)';
    });

    function startSession() {
      cycle.value = 0;
      phaseIndex = 0;
      runPhase();
    }

    function runPhase() {
      const p = phases[phaseIndex];
      phase.value = p;
      countdown.value = phaseConfig[p];
      timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
          phaseIndex++;
          if (phaseIndex >= phases.length) {
            phaseIndex = 0;
            cycle.value++;
            if (cycle.value >= targetCycles.value) {
              phase.value = 'done';
              return;
            }
            // Brief rest
            phase.value = 'rest';
            setTimeout(runPhase, 1500);
          } else {
            runPhase();
          }
        }
      }, 1000);
    }

    function stopSession() {
      clearInterval(timer);
      emit('navigate', 'breathwork-hub');
    }

    onUnmounted(() => clearInterval(timer));

    function changeCycles(d) {
      targetCycles.value = Math.max(1, Math.min(8, targetCycles.value + d));
    }

    return { targetCycles, phase, countdown, cycle, blobStyle, phaseLabel, phaseColor, startSession, stopSession, changeCycles };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="stopSession">←</button>
        <h2>4-7-8 Breathing</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 40px; text-align:center;">

        <div v-if="phase === 'idle'">
          <div style="background:linear-gradient(135deg, rgba(139,173,184,0.15), rgba(123,160,138,0.15)); border-radius:16px; padding:16px; margin-bottom:28px; text-align:left;">
            <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6;">
              🌙 <strong style="color:var(--text-primary);">Excellent for sleep and anxiety.</strong> Inhale for 4 counts, hold for 7, exhale for 8. The long exhale activates your parasympathetic nervous system.
            </p>
          </div>

          <div style="margin-bottom:40px;">
            <p style="font-weight:500; margin-bottom:16px;">Number of cycles</p>
            <div style="display:flex; align-items:center; justify-content:center; gap:24px;">
              <button class="btn btn-secondary" style="width:52px; height:52px; border-radius:50%; font-size:24px; padding:0;" @click="changeCycles(-1)">−</button>
              <span style="font-size:3rem; font-family:'Cormorant Garamond',serif; color:var(--accent); min-width:60px; display:inline-block;">{{ targetCycles }}</span>
              <button class="btn btn-secondary" style="width:52px; height:52px; border-radius:50%; font-size:24px; padding:0;" @click="changeCycles(1)">+</button>
            </div>
          </div>

          <button class="btn btn-primary btn-full" @click="startSession">Begin</button>
        </div>

        <div v-else-if="phase === 'done'" style="padding-top:40px;">
          <div class="completion-icon">🌙</div>
          <h2 style="font-size:1.8rem; margin-top:16px; margin-bottom:8px;">Session Complete</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px;">{{ targetCycles }} cycles of 4-7-8 breathing complete. Rest well.</p>
          <button class="btn btn-primary" @click="stopSession">Return</button>
        </div>

        <div v-else style="padding-top:8px;">
          <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:24px;">Cycle {{ cycle + 1 }} of {{ targetCycles }}</div>

          <div style="display:flex; align-items:center; justify-content:center; margin-bottom:28px; height:220px;">
            <div :style="{
              width: '180px',
              height: '180px',
              transition: 'transform 1s ease-in-out, border-radius 1s ease-in-out, background 1s ease-in-out',
              boxShadow: '0 0 40px rgba(139,173,184,0.3)',
              ...blobStyle
            }"></div>
          </div>

          <div style="font-size:1.4rem; letter-spacing:0.06em; font-weight:500; margin-bottom:6px;" :style="{color: phaseColor}">{{ phaseLabel }}</div>
          <div style="font-size:5rem; font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--text-primary); line-height:1; margin-bottom:8px;">{{ countdown }}</div>
          <div style="display:flex; justify-content:center; gap:4px; margin-top:16px;">
            <span style="font-size:0.75rem; color:var(--text-secondary); background:var(--bg-secondary); padding:3px 8px; border-radius:20px;">4 inhale</span>
            <span style="font-size:0.75rem; color:var(--text-secondary); background:var(--bg-secondary); padding:3px 8px; border-radius:20px;">7 hold</span>
            <span style="font-size:0.75rem; color:var(--text-secondary); background:var(--bg-secondary); padding:3px 8px; border-radius:20px;">8 exhale</span>
          </div>

          <button class="btn btn-ghost" style="margin-top:32px;" @click="stopSession">Stop</button>
        </div>
      </div>
    </div>
  `
};

// ─── MeditationHub ────────────────────────────────────────────────────────────
const MeditationHub = {
  emits: ['navigate', 'start-meditation'],
  setup(_, { emit }) {
    const durations = [1, 3, 5, 10, 15, 20, 30];
    const selectedDuration = ref(5);
    const intervalBell = ref(false);
    const guidedPrompts = ref(false);

    function begin() {
      emit('start-meditation', {
        duration: selectedDuration.value,
        intervalBell: intervalBell.value,
        guidedPrompts: guidedPrompts.value,
      });
      emit('navigate', 'meditation-session');
    }

    return { durations, selectedDuration, intervalBell, guidedPrompts, begin };
  },
  template: `
    <div class="screen">
      <div class="screen-header">
        <button class="btn-icon" @click="$emit('navigate','home')">←</button>
        <h2>Meditation</h2>
      </div>
      <div class="max-w" style="padding: 0 24px 120px;">
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:32px; margin-top:-4px;">Choose your session length and settle into stillness.</p>

        <div style="margin-bottom:32px;">
          <p class="section-label" style="margin-bottom:14px;">Duration</p>
          <div style="display:flex; flex-wrap:wrap; gap:10px;">
            <button
              v-for="d in durations" :key="d"
              class="btn"
              :class="selectedDuration === d ? 'btn-primary' : 'btn-secondary'"
              @click="selectedDuration = d"
              style="min-width:68px; font-size:0.95rem;"
            >{{ d === 1 ? '1 min' : d + ' min' }}</button>
          </div>
        </div>

        <div style="margin-bottom:32px;">
          <p class="section-label" style="margin-bottom:14px;">Options</p>
          <div style="background:white; border-radius:16px; padding:0 16px; border:1.5px solid var(--bg-secondary);">
            <div class="toggle-row">
              <div>
                <div style="font-weight:500; font-size:0.95rem;">Interval Bell</div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">Gentle pulse every 5 minutes</div>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="intervalBell" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="toggle-row">
              <div>
                <div style="font-weight:500; font-size:0.95rem;">Guided Prompts</div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">Gentle reminders during your session</div>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="guidedPrompts" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-full" @click="begin" style="font-size:1.05rem; padding:16px;">
          Begin {{ selectedDuration === 1 ? '1 minute' : selectedDuration + ' minute' }} session
        </button>
      </div>
    </div>
  `
};

// ─── MeditationSession ────────────────────────────────────────────────────────
const MeditationSession = {
  props: ['settings'],
  emits: ['navigate'],
  setup(props, { emit }) {
    const duration = computed(() => (props.settings && props.settings.duration) ? props.settings.duration * 60 : 300);
    const guidedPrompts = computed(() => props.settings && props.settings.guidedPrompts);
    const intervalBell = computed(() => props.settings && props.settings.intervalBell);

    const remaining = ref(0);
    const done = ref(false);
    const currentPrompt = ref('');
    const showPrompt = ref(false);
    const showPulse = ref(false);
    let timer = null;
    let elapsed = 0;

    const prompts = [
      'Bring your attention gently to your breath.',
      'Notice the rise and fall of your chest.',
      'If thoughts arise, acknowledge them and let them pass.',
      'You are here. Present. Breathing.',
      'There is nowhere to be but here.',
      'Soften your jaw. Relax your shoulders.',
      'Return to the breath, your anchor in this moment.',
      'All is well. You are at peace.',
    ];
    let promptIndex = 0;

    onMounted(() => {
      remaining.value = duration.value;
      // Initial prompt
      if (guidedPrompts.value) {
        setTimeout(() => {
          currentPrompt.value = prompts[0];
          showPrompt.value = true;
          setTimeout(() => { showPrompt.value = false; }, 5000);
        }, 2000);
      }

      timer = setInterval(() => {
        remaining.value--;
        elapsed++;

        // Interval bell every 5 minutes
        if (intervalBell.value && elapsed % 300 === 0 && remaining.value > 0) {
          showPulse.value = true;
          setTimeout(() => { showPulse.value = false; }, 2000);
        }

        // Guided prompts every 60 seconds
        if (guidedPrompts.value && elapsed % 60 === 0 && remaining.value > 0) {
          promptIndex = (promptIndex + 1) % prompts.length;
          currentPrompt.value = prompts[promptIndex];
          showPrompt.value = true;
          setTimeout(() => { showPrompt.value = false; }, 6000);
        }

        if (remaining.value <= 0) {
          clearInterval(timer);
          done.value = true;
        }
      }, 1000);
    });

    onUnmounted(() => clearInterval(timer));

    const progress = computed(() => 1 - remaining.value / duration.value);
    const achievedMinutes = computed(() => Math.floor(elapsed / 60));

    function endSession() {
      clearInterval(timer);
      emit('navigate', 'meditation-hub');
    }

    return { remaining, done, currentPrompt, showPrompt, showPulse, progress, achievedMinutes, endSession, fmtTime };
  },
  template: `
    <div style="position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
      <div class="meditation-bg"></div>

      <!-- Pulse ring for interval bell -->
      <transition name="fade">
        <div v-if="showPulse" style="position:absolute; width:200px; height:200px; border-radius:50%; border:2px solid var(--accent-warm); animation:softPulse 2s ease-out forwards; opacity:0.5; pointer-events:none;"></div>
      </transition>

      <div v-if="!done" style="position:relative; text-align:center; padding:40px 32px; z-index:1; max-width:400px; width:100%;">
        <!-- Time remaining -->
        <div style="font-size:4.5rem; font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--text-primary); line-height:1; margin-bottom:12px;">
          {{ fmtTime(remaining) }}
        </div>
        <p style="color:var(--text-secondary); font-size:0.85rem; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:40px;">remaining</p>

        <!-- Progress arc (simple bar) -->
        <div class="progress-bar" style="max-width:240px; margin: 0 auto 40px;">
          <div class="progress-bar-fill" :style="{width: (progress*100)+'%', background:'var(--accent-warm)'}"></div>
        </div>

        <!-- Guided prompt -->
        <div style="min-height:60px; display:flex; align-items:center; justify-content:center; margin-bottom:40px;">
          <transition name="fade">
            <p v-if="showPrompt" style="font-size:1.1rem; font-family:'Cormorant Garamond',serif; font-style:italic; color:var(--text-secondary); line-height:1.6; max-width:320px;">
              {{ currentPrompt }}
            </p>
          </transition>
        </div>

        <button class="btn btn-ghost" @click="endSession">End Session</button>
      </div>

      <div v-else style="position:relative; text-align:center; padding:40px 32px; z-index:1;">
        <div class="completion-icon">✨</div>
        <h2 style="font-size:2rem; margin-top:20px; margin-bottom:10px; font-family:'Cormorant Garamond',serif;">Session Complete</h2>
        <p style="color:var(--text-secondary); margin-bottom:8px;">{{ achievedMinutes }} minute{{ achievedMinutes !== 1 ? 's' : '' }} of stillness.</p>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:36px; font-style:italic;">Carry this peace with you.</p>
        <button class="btn btn-primary" @click="endSession">Return</button>
      </div>
    </div>
  `
};

// ─── BottomNav ────────────────────────────────────────────────────────────────
const BottomNav = {
  props: ['currentScreen'],
  emits: ['navigate'],
  setup(props, { emit }) {
    const items = [
      { screen: 'home', label: 'Home', icon: '🏠' },
      { screen: 'grounding-hub', label: 'Ground', icon: '🌱' },
      { screen: 'breathwork-hub', label: 'Breathe', icon: '🌬️' },
      { screen: 'meditation-hub', label: 'Meditate', icon: '✨' },
    ];

    const hubScreens = ['home','grounding-hub','breathwork-hub','meditation-hub'];
    const isActive = (s) => {
      if (s === 'home') return props.currentScreen === 'home';
      return props.currentScreen === s || props.currentScreen.startsWith(s.replace('-hub',''));
    };

    return { items, isActive, emit };
  },
  template: `
    <nav class="bottom-nav">
      <button
        v-for="item in items"
        :key="item.screen"
        :class="{ active: isActive(item.screen) }"
        @click="emit('navigate', item.screen)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  `
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = {
  components: {
    WelcomeScreen, HomeScreen, GroundingHub, SensesExercise, BodyScan,
    ObjectFocus, GroundingFeet, LeavesOnStream, BreathworkHub,
    WimHofBreathing, BoxBreathing, FourSevenEight, MeditationHub,
    MeditationSession, BottomNav
  },
  setup() {
    const currentScreen = ref('welcome');
    const userName = ref('');
    const preferences = ref({ lastScreen: null });
    const meditationSettings = ref({ duration: 5, intervalBell: false, guidedPrompts: false });

    // Load from storage
    onMounted(() => {
      const stored = loadLocal('stillness_name');
      const onboarded = loadLocal('stillness_onboarded');
      const prefs = loadLocal('stillness_preferences');
      if (stored) userName.value = stored;
      if (prefs) preferences.value = prefs;
      if (onboarded && stored) currentScreen.value = 'home';
    });

    function navigate(screen) {
      currentScreen.value = screen;
      // Track last used exercise
      const exercises = ['grounding-senses','grounding-bodyscan','grounding-object','grounding-feet','grounding-leaves','breathwork-wimhof','breathwork-box','breathwork-478','meditation-session'];
      if (exercises.includes(screen)) {
        preferences.value = { ...preferences.value, lastScreen: screen };
        saveLocal('stillness_preferences', preferences.value);
      }
    }

    function onBegin(name) {
      userName.value = name;
      currentScreen.value = 'home';
    }

    function onStartMeditation(settings) {
      meditationSettings.value = settings;
    }

    const showBottomNav = computed(() => {
      const navScreens = ['home','grounding-hub','breathwork-hub','meditation-hub'];
      return navScreens.includes(currentScreen.value);
    });

    const showTransition = computed(() => currentScreen.value !== 'grounding-leaves' && currentScreen.value !== 'meditation-session');

    return {
      currentScreen, userName, preferences, meditationSettings,
      navigate, onBegin, onStartMeditation, showBottomNav
    };
  },
  template: `
    <div id="app-inner" style="height:100%; display:flex; flex-direction:column; overflow:hidden;">
      <transition name="fade" mode="out-in">
        <WelcomeScreen v-if="currentScreen === 'welcome'" :key="'welcome'" @begin="onBegin" />
        <HomeScreen v-else-if="currentScreen === 'home'" :key="'home'" :name="userName" :preferences="preferences" @navigate="navigate" />
        <GroundingHub v-else-if="currentScreen === 'grounding-hub'" :key="'grounding-hub'" @navigate="navigate" />
        <SensesExercise v-else-if="currentScreen === 'grounding-senses'" :key="'grounding-senses'" @navigate="navigate" />
        <BodyScan v-else-if="currentScreen === 'grounding-bodyscan'" :key="'grounding-bodyscan'" @navigate="navigate" />
        <ObjectFocus v-else-if="currentScreen === 'grounding-object'" :key="'grounding-object'" @navigate="navigate" />
        <GroundingFeet v-else-if="currentScreen === 'grounding-feet'" :key="'grounding-feet'" @navigate="navigate" />
        <LeavesOnStream v-else-if="currentScreen === 'grounding-leaves'" :key="'grounding-leaves'" @navigate="navigate" />
        <BreathworkHub v-else-if="currentScreen === 'breathwork-hub'" :key="'breathwork-hub'" @navigate="navigate" />
        <WimHofBreathing v-else-if="currentScreen === 'breathwork-wimhof'" :key="'breathwork-wimhof'" @navigate="navigate" />
        <BoxBreathing v-else-if="currentScreen === 'breathwork-box'" :key="'breathwork-box'" @navigate="navigate" />
        <FourSevenEight v-else-if="currentScreen === 'breathwork-478'" :key="'breathwork-478'" @navigate="navigate" />
        <MeditationHub v-else-if="currentScreen === 'meditation-hub'" :key="'meditation-hub'" @navigate="navigate" @start-meditation="onStartMeditation" />
        <MeditationSession v-else-if="currentScreen === 'meditation-session'" :key="'meditation-session'" :settings="meditationSettings" @navigate="navigate" />
      </transition>
      <BottomNav v-if="showBottomNav" :currentScreen="currentScreen" @navigate="navigate" />
    </div>
  `
};

createApp(App).mount('#app');

// ─── Service Worker ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
