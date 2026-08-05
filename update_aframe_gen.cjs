const fs = require('fs');
let code = fs.readFileSync('src/lib/aframeGenerator.ts', 'utf8');

// We need to inject the state-machine component.
const componentLogic = `
      // --- New State & Event Machine Component ---
      AFRAME.registerComponent('state-machine', {
        schema: {
          states: { type: 'string', default: '[]' },
          events: { type: 'string', default: '[]' }
        },
        init: function() {
          const el = this.el;
          this.states = [];
          this.events = [];
          try {
            this.states = JSON.parse(this.data.states || '[]');
            this.events = JSON.parse(this.data.events || '[]');
          } catch(e) { console.error("Error parsing state machine config:", e); }

          // Preload sounds
          this.events.forEach(evt => {
            (evt.actions || []).forEach(act => {
              if (act.type === 'playSound' && act.soundUrl) {
                const a = new Audio();
                a.preload = 'auto';
                a.src = act.soundUrl;
              }
            });
          });

          // Bind events
          this.events.forEach(evt => {
            if (evt.trigger === 'start') {
              this.executeActions(evt.actions);
            } else if (evt.trigger === 'onTap') {
              el.addEventListener('click', (e) => {
                if (window.isDuplicateClick && window.isDuplicateClick(el)) return;
                if (e.type === 'touchstart') return;
                this.executeActions(evt.actions);
              });
            } else if (evt.trigger === 'onHoverEnter') {
              el.addEventListener('mouseenter', () => this.executeActions(evt.actions));
            } else if (evt.trigger === 'onHoverExit') {
              el.addEventListener('mouseleave', () => this.executeActions(evt.actions));
            } else if (evt.trigger === 'onKeyDown' && evt.triggerKey) {
              window.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === evt.triggerKey.toLowerCase()) {
                  this.executeActions(evt.actions);
                }
              });
            }
          });
        },
        executeActions: function(actions) {
          if (!actions) return;
          actions.forEach(act => {
            if (act.type === 'playSound' && act.soundUrl) {
              const audio = new Audio(act.soundUrl);
              audio.volume = 0.5;
              audio.play().catch(e => console.error(e));
            } else if (act.type === 'openUrl' && act.url) {
              window.open(act.url, '_blank');
            } else if (act.type === 'toast' && act.toastMessage) {
              alert(act.toastMessage);
            } else if (act.type === 'hide') {
              const targetEl = act.targetId ? document.getElementById(act.targetId) : this.el;
              if (targetEl) targetEl.setAttribute('visible', 'false');
            } else if (act.type === 'show') {
              const targetEl = act.targetId ? document.getElementById(act.targetId) : this.el;
              if (targetEl) targetEl.setAttribute('visible', 'true');
            } else if (act.type === 'transition') {
              const targetEl = act.targetId ? document.getElementById(act.targetId) : this.el;
              if (targetEl && act.transitionTargetStateId) {
                // Find target state definition
                // We'll search in our states array, or if it's another object, we'd need its states.
                // Assuming it's our own state for now:
                const state = this.states.find(s => s.id === act.transitionTargetStateId);
                if (state) {
                  const duration = (act.transitionDuration || 1.0) * 1000;
                  if (state.position) {
                    targetEl.setAttribute('animation__pos', \`property: position; to: \${state.position[0]} \${state.position[1]} \${state.position[2]}; dur: \${duration}; easing: easeInOutQuad\`);
                  }
                  if (state.rotation) {
                    targetEl.setAttribute('animation__rot', \`property: rotation; to: \${state.rotation[0]} \${state.rotation[1]} \${state.rotation[2]}; dur: \${duration}; easing: easeInOutQuad\`);
                  }
                  if (state.scale) {
                    targetEl.setAttribute('animation__scale', \`property: scale; to: \${state.scale[0]} \${state.scale[1]} \${state.scale[2]}; dur: \${duration}; easing: easeInOutQuad\`);
                  }
                } else if (act.transitionTargetStateId === 'base') {
                  // base state
                  const basePos = targetEl.getAttribute('data-base-position');
                  const baseRot = targetEl.getAttribute('data-base-rotation');
                  const baseScale = targetEl.getAttribute('data-base-scale');
                  const duration = (act.transitionDuration || 1.0) * 1000;
                  if (basePos) targetEl.setAttribute('animation__pos', \`property: position; to: \${basePos}; dur: \${duration}; easing: easeInOutQuad\`);
                  if (baseRot) targetEl.setAttribute('animation__rot', \`property: rotation; to: \${baseRot}; dur: \${duration}; easing: easeInOutQuad\`);
                  if (baseScale) targetEl.setAttribute('animation__scale', \`property: scale; to: \${baseScale}; dur: \${duration}; easing: easeInOutQuad\`);
                }
              }
            }
          });
        }
      });
`;

// Insert the component logic right before visual-behavior
code = code.replace(/AFRAME\.registerComponent\('visual-behavior', \{/, componentLogic + "\n      AFRAME.registerComponent('visual-behavior', {");

// Inject state-machine attribute instead of visual-behavior
code = code.replace(
  /if \(\(obj\.events \|\| \[\]\) && \(obj\.events \|\| \[\]\)\.length > 0\) \{[\s\S]*?customComponents \+\= \` visual-behavior data-behaviors="\$\{behaviorsJson\}"\`;/g,
  `if (obj.events && obj.events.length > 0) {
        const eventsJson = JSON.stringify(obj.events).replace(/"/g, '&quot;');
        const statesJson = JSON.stringify(obj.states || []).replace(/"/g, '&quot;');
        customComponents += \` state-machine="events: \${eventsJson}; states: \${statesJson}" \`;
        customComponents += \` data-base-position="\${obj.position.join(' ')}" data-base-rotation="\${obj.rotation.join(' ')}" data-base-scale="\${obj.scale.join(' ')}" \`;`
);

// We need to also attach data-base-* on all objects. Let's do that for the generic object creation.
// Look for where we build the entity:
fs.writeFileSync('src/lib/aframeGenerator.ts', code);
