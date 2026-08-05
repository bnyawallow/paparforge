const fs = require('fs');
let code = fs.readFileSync('src/components/hierarchy/HierarchyPanel.tsx', 'utf8');
code = code.replace(
`              {obj.events && obj.events.length > 0 && (() => {
                const behaviors = obj.events || [];
                let hasAudio = false;
                let hasVisibility = false;
                let hasAnimation = false;
                let hasInteraction = false;
                behaviors.forEach((b: any) => {
                  const act = b.action;
                  if (act === 'playSound') {
                    hasAudio = true;
                  } else if (act === 'toggleVisibility' || act === 'setVisibility') {
                    hasVisibility = true;
                  } else if (['playModelAnimation', 'pauseModelAnimation', 'spin', 'startBehavior', 'scaleUp', 'scaleDown', 'transform'].includes(act)) {
                    hasAnimation = true;
                  } else {
                    hasInteraction = true;
                  }
                });`,
`              {obj.events && obj.events.length > 0 && (() => {
                const events = obj.events || [];
                let hasAudio = false;
                let hasVisibility = false;
                let hasAnimation = false;
                let hasInteraction = false;
                events.forEach((evt: any) => {
                  (evt.actions || []).forEach((a: any) => {
                    const act = a.type;
                    if (act === 'playSound') {
                      hasAudio = true;
                    } else if (act === 'show' || act === 'hide') {
                      hasVisibility = true;
                    } else if (['playAnimation', 'pauseAnimation', 'transition'].includes(act)) {
                      hasAnimation = true;
                    } else {
                      hasInteraction = true;
                    }
                  });
                });`
);
fs.writeFileSync('src/components/hierarchy/HierarchyPanel.tsx', code);
