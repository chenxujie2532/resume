/* ============================================
   陈旭杰 · 个人简历网站 - 交互脚本（精美版）
   功能：
   - 导航 / 滚动进度条 / 锚点平滑
   - reveal-word 逐词浮现 + 经典 reveal
   - 数字计数器（Hero 指标）
   - 打字机效果
   - 粒子背景
   - 3D 卡片倾斜 + 流光角度
   - 光标视差（Hero 光球/极光带）
   - Spotlight 柔光跟随
   - Toast 提示 / 剪贴板复制
   - 一键打印 PDF
   ============================================ */

(function () {
    'use strict';

    // =================== 通用图片两级回退 ===================
    (function setupUniversalImageFallback() {
        const bindLoadedFx = function (imgEl, loadedClass) {
            if (!imgEl) return;
            const cls = loadedClass || 'img-loaded';
            const markLoaded = () => imgEl.classList.add(cls);
            if (imgEl.complete && imgEl.naturalWidth > 0) {
                markLoaded();
            } else {
                imgEl.addEventListener('load', markLoaded, { once: true });
            }
        };
        window.__imgFallback = function (imgEl) {
            if (!imgEl) return;
            if (!imgEl.dataset.fallbackTried) {
                const alt = imgEl.dataset.fallbackSrc;
                if (alt) {
                    imgEl.dataset.fallbackTried = '1';
                    imgEl.onerror = function () { imgEl.classList.add('img-failed'); };
                    const cls = imgEl.classList.contains('shot-img') ? 'shot-loaded' :
                                imgEl.classList.contains('avatar-img') ? 'avatar-loaded' : 'img-loaded';
                    bindLoadedFx(imgEl, cls);
                    imgEl.src = alt;
                    return;
                }
            }
            imgEl.classList.add('img-failed');
        };
        window.__avatarFallback = window.__imgFallback;
        document.addEventListener('DOMContentLoaded', () => {
            $$('img.avatar-img').forEach(img => bindLoadedFx(img, 'avatar-loaded'));
            $$('img.shot-img').forEach(img => bindLoadedFx(img, 'shot-loaded'));
        });
    })();

    // =================== 工具函数 ===================
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const throttle = (fn, delay = 100) => {
        let last = 0;
        return function (...args) {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn.apply(this, args);
            }
        };
    };
    const rafThrottle = (fn) => {
        let ticking = false;
        return function (...args) {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                try { fn.apply(this, args); } finally { ticking = false; }
            });
        };
    };
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = () => window.matchMedia('(pointer: fine)').matches;

    // =================== Toast 系统 ===================
    const Toast = (() => {
        const DURATION = 2600;
        let wrap;
        const ensure = () => {
            if (!wrap) {
                wrap = $('#toastWrap');
                if (!wrap) {
                    wrap = document.createElement('div');
                    wrap.id = 'toastWrap';
                    wrap.className = 'toast-wrap';
                    wrap.setAttribute('aria-live', 'polite');
                    document.body.appendChild(wrap);
                }
            }
            return wrap;
        };
        const show = ({ icon = '✨', text = '', value = '' } = {}) => {
            const w = ensure();
            const el = document.createElement('div');
            el.className = 'toast';
            el.innerHTML =
                `<span class="toast-icon">${icon}</span>` +
                `<span class="toast-text">${text}${value ? `<span class="toast-value">${value}</span>` : ''}</span>`;
            w.appendChild(el);
            setTimeout(() => {
                el.classList.add('toast-out');
                setTimeout(() => el.remove(), 420);
            }, DURATION);
        };
        return { show };
    })();

    // =================== 导航栏 / 滚动进度条 ===================
    const NavbarController = (() => {
        const init = () => {
            const navbar = $('#navbar');
            const progress = $('#scrollProgress');
            const hamburger = $('#hamburger');
            const navMenu = $('#navMenu');
            const navLinks = $$('.nav-link');
            const sections = $$('section[id]');
            if (!navbar) return;

            const updateProgress = () => {
                const doc = document.documentElement;
                const scrollTop = window.scrollY || doc.scrollTop || 0;
                const scrollHeight = doc.scrollHeight - doc.clientHeight;
                const pct = scrollHeight > 0 ? clamp((scrollTop / scrollHeight) * 100, 0, 100) : 0;
                if (progress) progress.style.width = pct + '%';
            };

            const onScroll = throttle(() => {
                const y = window.scrollY;
                navbar.classList.toggle('scrolled', y > 50);
                const backToTop = $('#backToTop');
                if (backToTop) backToTop.classList.toggle('show', y > 400);
                updateProgress();
                updateActiveLink();
            }, 40);

            const updateActiveLink = () => {
                const scrollY = window.scrollY + 140;
                let current = '';
                for (const sec of sections) {
                    const top = sec.offsetTop;
                    const height = sec.offsetHeight;
                    if (scrollY >= top && scrollY < top + height) { current = sec.id; break; }
                }
                navLinks.forEach(link => {
                    const href = link.getAttribute('href').replace('#', '');
                    link.classList.toggle('active', href === current);
                });
            };

            const toggleMenu = () => {
                const isActive = hamburger.classList.toggle('active');
                navMenu.classList.toggle('active', isActive);
                document.body.style.overflow = isActive ? 'hidden' : '';
            };
            const closeMenu = () => {
                hamburger && hamburger.classList.remove('active');
                navMenu && navMenu.classList.remove('active');
                document.body.style.overflow = '';
            };

            const smoothScrollTo = (targetId, e) => {
                const target = document.getElementById(targetId);
                if (!target) return;
                if (e) e.preventDefault();
                closeMenu();
                const offset = 84;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            };

            document.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', throttle(() => { if (!isMobile()) closeMenu(); }, 200));
            if (hamburger) hamburger.addEventListener('click', toggleMenu);
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) smoothScrollTo(href.slice(1), e);
                });
            });
            $$('a[href^="#"]:not(.nav-link)').forEach(a => {
                a.addEventListener('click', (e) => {
                    const href = a.getAttribute('href');
                    if (href.length > 1) smoothScrollTo(href.slice(1), e);
                });
            });

            // 返回顶部按钮
            const btt = $('#backToTop');
            if (btt) btt.addEventListener('click', (e) => { e.preventDefault(); smoothScrollTo('hero', e); });

            // 打印 PDF
            const btnPrint = $('#btnPrintResume');
            if (btnPrint) btnPrint.addEventListener('click', () => {
                Toast.show({ icon: '🖨️', text: '准备生成 PDF…' });
                setTimeout(() => { try { window.print(); } catch (e) { Toast.show({ icon: '❌', text: '浏览器阻止了打印，可按 Ctrl+P 手动打印' }); } }, 350);
            });

            // 初始一次
            onScroll();
            updateProgress();
        };
        return { init };
    })();

    // =================== Reveal：逐词浮现 + 经典 reveal ===================
    const RevealController = (() => {
        const init = () => {
            const addVisible = (el) => {
                el.classList.add('visible');
                if (el.classList.contains('reveal-word')) el.classList.add('is-visible');
            };
            if (prefersReducedMotion()) {
                $$('.reveal, .reveal-word').forEach(addVisible);
                return;
            }
            if (!('IntersectionObserver' in window)) {
                $$('.reveal, .reveal-word').forEach(addVisible);
                SkillBarController.animateAll();
                CounterController.runAll();
                return;
            }
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        addVisible(entry.target);
                        // 触发关联动画
                        if (entry.target.closest('.skills-bars') || entry.target.classList.contains('skills-bars')) {
                            SkillBarController.animateAll();
                        }
                        if (entry.target.classList.contains('hero-stats') || entry.target.closest('.hero-stats')) {
                            CounterController.runAll();
                        }
                        if (entry.target.classList.contains('counter')) {
                            CounterController.run(entry.target);
                        }
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

            $$('.reveal').forEach(el => obs.observe(el));
            $$('.reveal-word').forEach(el => {
                // 尊重 data-delay 转换到 transitionDelay
                const d = el.getAttribute('data-delay');
                if (d) el.style.setProperty('--delay', d);
                obs.observe(el);
            });
        };
        return { init };
    })();

    // =================== 技能进度条 ===================
    const SkillBarController = (() => {
        const animateOne = (bar) => {
            const level = Number(bar.getAttribute('data-level')) || 0;
            requestAnimationFrame(() => {
                bar.style.width = Math.min(100, Math.max(0, level)) + '%';
            });
        };
        return {
            animate: (c) => $$('.skill-progress', c).forEach(animateOne),
            animateAll: () => $$('.skill-progress').forEach(animateOne)
        };
    })();

    // =================== Hero 数字计数器 ===================
    const CounterController = (() => {
        const state = new WeakMap();
        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const runOne = (el) => {
            if (!el || state.get(el)) return;
            const target = Number(el.dataset.target || '0') || 0;
            const duration = 1600;
            const start = performance.now();
            state.set(el, true);
            const tick = (now) => {
                const p = clamp((now - start) / duration, 0, 1);
                const v = Math.round(easeOutExpo(p) * target);
                el.textContent = String(v);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = String(target);
            };
            requestAnimationFrame(tick);
        };
        return {
            run: runOne,
            runAll: () => $$('.counter').forEach(runOne)
        };
    })();

    // =================== 打字机效果 ===================
    const TypedController = (() => {
        const phrases = [
            '宁夏大学 · 智能科学与技术专业 · 准大一新生',
            '热爱 AI 技术 · 探索机器学习的无限可能',
            '从代码到算法 · 用好奇心驱动每一天成长',
            '以梦为马 · 不负韶华 · 愿在 AI 浪潮中书写精彩'
        ];
        const init = () => {
            const el = $('#typedText');
            if (!el) return;
            if (prefersReducedMotion()) { el.textContent = phrases[0]; return; }
            let phraseIdx = 0, charIdx = 0, deleting = false;
            const tick = () => {
                const phrase = phrases[phraseIdx];
                if (!deleting) {
                    charIdx++;
                    el.textContent = phrase.slice(0, charIdx);
                    if (charIdx === phrase.length) { deleting = true; return setTimeout(tick, 1800); }
                    setTimeout(tick, 70 + Math.random() * 60);
                } else {
                    charIdx--;
                    el.textContent = phrase.slice(0, charIdx);
                    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; return setTimeout(tick, 400); }
                    setTimeout(tick, 30 + Math.random() * 20);
                }
            };
            setTimeout(tick, 1200);
        };
        return { init };
    })();

    // =================== 粒子背景 ===================
    const ParticleController = (() => {
        const init = () => {
            const canvas = $('#particleCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx || prefersReducedMotion()) return;

            let width, height, particles;
            const DPR = Math.min(window.devicePixelRatio || 1, 2);
            const getCount = () => {
                const base = Math.min(window.innerWidth, 1440);
                return Math.max(24, Math.floor(base / 38));
            };
            const COLORS = [[79, 70, 229], [6, 182, 212], [139, 92, 246], [16, 185, 129], [236, 72, 153]];

            const resize = () => {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width * DPR;
                canvas.height = height * DPR;
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
                ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
                const count = getCount();
                particles = new Array(count).fill(0).map(() => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: 1 + Math.random() * 2,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    a: 0.25 + Math.random() * 0.4
                }));
            };
            const step = () => {
                ctx.clearRect(0, 0, width, height);
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
                    if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.a})`;
                    ctx.fill();
                }
                const maxDist = 110, maxDist2 = maxDist * maxDist;
                for (let i = 0; i < particles.length; i++) {
                    const a = particles[i];
                    for (let j = i + 1; j < particles.length; j++) {
                        const b = particles[j];
                        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
                        if (d2 < maxDist2) {
                            const alpha = (1 - d2 / maxDist2) * 0.18;
                            ctx.strokeStyle = `rgba(${(a.color[0]+b.color[0])/2|0},${(a.color[1]+b.color[1])/2|0},${(a.color[2]+b.color[2])/2|0},${alpha})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                        }
                    }
                }
                rafId = requestAnimationFrame(step);
            };
            let rafId;
            const onVisibility = () => {
                if (document.hidden) cancelAnimationFrame(rafId);
                else rafId = requestAnimationFrame(step);
            };
            resize();
            window.addEventListener('resize', throttle(resize, 200));
            document.addEventListener('visibilitychange', onVisibility);
            rafId = requestAnimationFrame(step);
        };
        return { init };
    })();

    // =================== 鼠标视差：Hero 光球 / 极光带 ===================
    const ParallaxController = (() => {
        const init = () => {
            if (!finePointer() || isMobile() || prefersReducedMotion()) return;
            const targets = $$('[data-parallax-depth]');
            if (!targets.length) return;
            // 记录初始位置（通过 CSS 变量避免覆盖 float 动画，使用 translate delta 叠加）
            targets.forEach((t, i) => {
                t.style.setProperty('--px-idx', String(i));
                t.style.setProperty('--px-base-x', '0px');
                t.style.setProperty('--px-base-y', '0px');
            });
            const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            const onMove = rafThrottle((e) => {
                const dx = (e.clientX - center.x) / center.x;  // -1 ~ 1
                const dy = (e.clientY - center.y) / center.y;
                for (const t of targets) {
                    const depth = Number(t.dataset.parallaxDepth || '16');
                    const tx = (dx * depth).toFixed(2) + 'px';
                    const ty = (dy * depth).toFixed(2) + 'px';
                    t.style.translate = `${tx} ${ty}`;
                }
            });
            const onLeave = () => targets.forEach(t => { t.style.translate = '0 0'; });
            window.addEventListener('mousemove', onMove, { passive: true });
            window.addEventListener('mouseleave', onLeave);
        };
        return { init };
    })();

    // =================== Spotlight 柔光跟随 ===================
    const SpotlightController = (() => {
        const init = () => {
            if (!finePointer() || isMobile() || prefersReducedMotion()) return;
            const el = $('#spotlightCursor');
            if (!el) return;
            let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
            let x = tx, y = ty;
            const onMove = (e) => { tx = e.clientX; ty = e.clientY; if (!el.classList.contains('visible')) el.classList.add('visible'); };
            const onLeave = () => el.classList.remove('visible');
            const tick = () => {
                x += (tx - x) * 0.12;
                y += (ty - y) * 0.12;
                el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
                raf = requestAnimationFrame(tick);
            };
            let raf = requestAnimationFrame(tick);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) { cancelAnimationFrame(raf); }
                else { raf = requestAnimationFrame(tick); }
            });
            window.addEventListener('mousemove', onMove, { passive: true });
            window.addEventListener('mouseleave', onLeave);
        };
        return { init };
    })();

    // =================== 卡片 3D 倾斜 + 流光角度 ===================
    const TiltController = (() => {
        const init = () => {
            if (!finePointer() || isMobile() || prefersReducedMotion()) return;
            const selectors = [
                '.about-card', '.info-card', '.edu-card',
                '.major-card', '.hobby-card',
                '.ability-card', '.goal-card',
                '.encounter-card', '.project-showcase',
                '.courses-card', '.pillar',
                '.cta-card', '.contact-item',
                '.hero-avatar'
            ];
            const cards = $$(selectors.join(','));
            cards.forEach(card => {
                let raf;
                const maxRot = Number(card.dataset.tilt || '0.06') * 60; // 默认 3.6deg
                const onMove = (e) => {
                    const rect = card.getBoundingClientRect();
                    const nx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 ~ 0.5
                    const ny = (e.clientY - rect.top) / rect.height - 0.5;
                    const angle = (Math.atan2(ny, nx) * 180 / Math.PI + 90 + 360) % 360;
                    if (raf) cancelAnimationFrame(raf);
                    raf = requestAnimationFrame(() => {
                        card.style.transform =
                            `translateY(-6px) perspective(900px) rotateY(${nx * maxRot}deg) rotateX(${-ny * maxRot}deg) scale(1.006)`;
                        card.style.setProperty('--tilt-angle', angle + 'deg');
                    });
                };
                const onLeave = () => {
                    if (raf) cancelAnimationFrame(raf);
                    card.style.transform = '';
                    card.style.removeProperty('--tilt-angle');
                };
                card.addEventListener('mousemove', onMove);
                card.addEventListener('mouseleave', onLeave);
            });
        };
        return { init };
    })();

    // =================== 联系信息复制 ===================
    const CopyController = (() => {
        const copyText = async (text) => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
            } catch (_) { /* fallthrough */ }
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                return ok;
            } catch (_) { return false; }
        };
        const toastResult = (ok, label, value) => {
            if (ok) Toast.show({ icon: '📋', text: `已复制${label}：`, value });
            else Toast.show({ icon: '❌', text: `复制失败，请手动选中复制：${value}` });
        };
        const init = () => {
            // 1) 显式复制按钮（电话右侧）
            $$('[data-copy-btn]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const host = btn.closest('[data-copy]');
                    if (!host) return;
                    const val = host.dataset.copy || '';
                    const label = host.dataset.copyLabel || '内容';
                    const ok = await copyText(val);
                    // 按钮态反馈
                    const span = btn.querySelector('span');
                    if (span) {
                        const orig = span.textContent;
                        span.textContent = ok ? '已复制 ✓' : '失败';
                        btn.classList.add('is-done');
                        setTimeout(() => { span.textContent = orig; btn.classList.remove('is-done'); }, 1600);
                    }
                    toastResult(ok, label, val);
                });
            });
            // 2) 非电话项，点击整项直接复制
            $$('.contact-item[data-copy]').forEach(item => {
                // 如果包含复制按钮（电话项），不再重复绑单击整项复制
                if (item.querySelector('[data-copy-btn]')) return;
                item.style.cursor = 'copy';
                item.addEventListener('click', async () => {
                    const val = item.dataset.copy || '';
                    const label = item.dataset.copyLabel || '内容';
                    const ok = await copyText(val);
                    toastResult(ok, label, val);
                    item.classList.add('copied');
                    setTimeout(() => item.classList.remove('copied'), 1200);
                });
            });
        };
        return { init };
    })();

    // =================== 欢迎 Toast ===================
    const WelcomeToast = (() => {
        const init = () => {
            setTimeout(() => {
                Toast.show({
                    icon: '👋',
                    text: '你好！欢迎来到陈旭杰的个人简历',
                    value: ''
                });
            }, 1200);
        };
        return { init };
    })();

    // =================== 初始化 ===================
    const boot = () => {
        const init = (name, fn) => { try { fn && fn.init && fn.init(); } catch (e) { console.warn && console.warn('[' + name + ']', e); } };
        init('Nav', NavbarController);
        init('Typed', TypedController);
        init('Particle', ParticleController);
        init('Reveal', RevealController);
        init('Tilt', TiltController);
        init('Parallax', ParallaxController);
        init('Spotlight', SpotlightController);
        init('Copy', CopyController);
        init('Welcome', WelcomeToast);
        // 若 hero 已经在首屏（首屏可见），立即触发计数器
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats && heroStats.getBoundingClientRect().top < window.innerHeight * 0.9) {
            setTimeout(() => CounterController.runAll(), 900);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
