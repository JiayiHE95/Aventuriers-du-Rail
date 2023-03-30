
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const villesData = {
        "Cadiz": { "x": 144, "y": 1072, "nom": "Cadiz" },
        "Madrid": { "x": 147, "y": 946, "nom": "Madrid" },
        "Barcelona": { "x": 336, "y": 961, "nom": "Barcelona" },
        "Lisboa": { "x": 32, "y": 981, "nom": "Lisboa" },
        "Pamplona": { "x": 318, "y": 805, "nom": "Pamplona" },
        "Paris": { "x": 425, "y": 544, "nom": "Paris" },
        "Dieppe": { "x": 341, "y": 467, "nom": "Dieppe" },
        "Brest": { "x": 188, "y": 516, "nom": "Brest" },
        "London": { "x": 358, "y": 313, "nom": "London" },
        "Amsterdam": { "x": 524, "y": 319, "nom": "Amsterdam" },
        "Bruxelles": { "x": 485, "y": 399, "nom": "Bruxelles" },
        "Edinburgh": { "x": 245, "y": 56, "nom": "Edinburgh" },
        "Zurich": { "x": 622, "y": 638, "nom": "Zurich" },
        "Marseille": { "x": 575, "y": 797, "nom": "Marseille" },
        "Frankfurt": { "x": 638, "y": 454, "nom": "Frankfurt" },
        "Munchen": { "x": 737, "y": 530, "nom": "Munchen" },
        "Wien": { "x": 930, "y": 559, "nom": "Wien" },
        "Venezia": { "x": 763, "y": 694, "nom": "Venezia" },
        "Roma": { "x": 779, "y": 849, "nom": "Roma" },
        "Brindisi": { "x": 925, "y": 892, "nom": "Brindisi" },
        "Palermo": { "x": 841, "y": 1072, "nom": "Palermo" },
        "Athina": { "x": 1136, "y": 1024, "nom": "Athina" },
        "Sofia": { "x": 1167, "y": 830, "nom": "Sofia" },
        "Sarajevo": { "x": 1053, "y": 815, "nom": "Sarajevo" },
        "Zagrab": { "x": 908, "y": 714, "nom": "Zagrab" },
        "Budapest": { "x": 1014, "y": 602, "nom": "Budapest" },
        "Kyiv": { "x": 1370, "y": 438, "nom": "Kyiv" },
        "Warszawa": { "x": 1113, "y": 345, "nom": "Warszawa" },
        "Wilno": { "x": 1302, "y": 303, "nom": "Wilno" },
        "Smolensk": { "x": 1479, "y": 310, "nom": "Smolensk" },
        "Moskva": { "x": 1625, "y": 269, "nom": "Moskva" },
        "Kharkov": { "x": 1600, "y": 528, "nom": "Kharkov" },
        "Rostov": { "x": 1671, "y": 618, "nom": "Rostov" },
        "Sochi": { "x": 1660, "y": 770, "nom": "Sochi" },
        "Erzurum": { "x": 1628, "y": 986, "nom": "Erzurum" },
        "Constantinople": { "x": 1358, "y": 932, "nom": "Constantinople" },
        "Angora": { "x": 1492, "y": 1026, "nom": "Angora" },
        "Smyrna": { "x": 1282, "y": 1068, "nom": "Smyrna" },
        "Essen": { "x": 663, "y": 335, "nom": "Essen" },
        "Berlin": { "x": 834, "y": 359, "nom": "Berlin" },
        "Kobenhavn": { "x": 784, "y": 155, "nom": "Kobenhavn" },
        "Stockholm": { "x": 963, "y": 22, "nom": "Stockholm" },
        "Riga": { "x": 1169, "y": 71, "nom": "Riga" },
        "Petrograd": { "x": 1458, "y": 64, "nom": "Petrograd" },
        "Danzig": { "x": 1028, "y": 226, "nom": "Danzig" },
        "Bucuresti": { "x": 1271, "y": 721, "nom": "Bucuresti" },
        "Sevastopol": { "x": 1508, "y": 746, "nom": "Sevastopol" }
    };

    const routesData = [
        { "ville1": "Amsterdam", "ville2": "Bruxelles", "longueur": 1, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 504.5, "y": 361.5, "dx": -0.42661867571297646, "dy": 0.9044315925115101 }] },
        { "ville1": "Amsterdam", "ville2": "Essen", "longueur": 3, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 528.5, "y": 276, "dx": 0.21871145691738075, "dy": -0.9757895770160064 }, { "x": 574, "y": 265, "dx": 0.9778024140774094, "dy": 0.20952908873087345 }, { "x": 629, "y": 300, "dx": 0.6368814469962913, "dy": 0.7709617516270895 }] },
        { "ville1": "Amsterdam", "ville2": "Frankfurt", "longueur": 2, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 562, "y": 358.5, "dx": 0.6983238520753277, "dy": 0.7157819483772108 }, { "x": 606, "y": 403, "dx": 0.7249994335944138, "dy": 0.688749461914693 }] },
        { "ville1": "Amsterdam", "ville2": "London", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 2, "segments": [{ "x": 405, "y": 312, "dx": 1, "dy": 0 }, { "x": 469, "y": 314.5, "dx": 0.9998514005489976, "dy": 0.017238817250844786 }] },
        { "ville1": "Angora", "ville2": "Constantinople", "longueur": 2, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1399, "y": 959, "dx": 0.8209052017854871, "dy": 0.5710644881985998 }, { "x": 1452, "y": 998, "dx": 0.8041761414663255, "dy": 0.5943910610838058 }] },
        { "ville1": "Angora", "ville2": "Erzurum", "longueur": 3, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1533.5, "y": 1046, "dx": 0.8765785507795943, "dy": 0.48125881219271843 }, { "x": 1597, "y": 1059.5, "dx": 0.9812488205210874, "dy": -0.19274530403092788 }, { "x": 1635.5, "y": 1031.5, "dx": -0.16148856811054085, "dy": -0.9868745828977495 }] },
        { "ville1": "Angora", "ville2": "Smyrna", "longueur": 3, "couleur": "ORANGE", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1329.5, "y": 1072.5, "dx": 0.9998347517133227, "dy": 0.01817881366751496 }, { "x": 1392.5, "y": 1072, "dx": 0.9895864392845114, "dy": -0.14393984571411075 }, { "x": 1455.5, "y": 1054, "dx": 0.8765785507795943, "dy": -0.48125881219271843 }] },
        { "ville1": "Athina", "ville2": "Brindisi", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 957, "y": 928, "dx": 0.389639990836698, "dy": 0.9209672510685588 }, { "x": 982, "y": 986.5, "dx": 0.38337767164151665, "dy": 0.9235916635000174 }, { "x": 1027.5, "y": 1030.5, "dx": 0.9554026409829016, "dy": 0.2953062708492605 }, { "x": 1093.5, "y": 1036, "dx": 0.9838699100999074, "dy": -0.17888543819998318 }] },
        { "ville1": "Athina", "ville2": "Sarajevo", "longueur": 4, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1052.5, "y": 859, "dx": -0.053494721371611896, "dy": 0.9985681322700888 }, { "x": 1049, "y": 922.5, "dx": -0.035066140133044446, "dy": 0.9993849937917667 }, { "x": 1045.5, "y": 986.5, "dx": -0.08444307668618062, "dy": 0.9964283048969312 }, { "x": 1087.5, "y": 1007, "dx": 0.9994259471398348, "dy": 0.033878845665757114 }] },
        { "ville1": "Athina", "ville2": "Smyrna", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 1180.5, "y": 1022, "dx": 0.9994259471398348, "dy": -0.033878845665757114 }, { "x": 1244.5, "y": 1036.5, "dx": 0.9044315925115101, "dy": 0.42661867571297646 }] },
        { "ville1": "Athina", "ville2": "Sofia", "longueur": 3, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1136, "y": 861, "dx": -0.6709133239691262, "dy": 0.7415357791237711 }, { "x": 1109.5, "y": 921, "dx": -0.11982016019085814, "dy": 0.9927956130099675 }, { "x": 1123, "y": 983, "dx": 0.52999894000318, "dy": 0.847998304005088 }] },
        { "ville1": "Barcelona", "ville2": "Madrid", "longueur": 2, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 221.5, "y": 954.5, "dx": 0.9998563940539735, "dy": 0.016946718543287685 }, { "x": 285.5, "y": 956.5, "dx": 0.9986178293325098, "dy": 0.052558833122763673 }] },
        { "ville1": "Barcelona", "ville2": "Marseille", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 370.5, "y": 926, "dx": 0.6610305430689966, "dy": -0.7503589948350772 }, { "x": 415.5, "y": 881.5, "dx": 0.7407190347407712, "dy": -0.6718149384858157 }, { "x": 467.5, "y": 843.5, "dx": 0.8692901189279536, "dy": -0.4943022244884442 }, { "x": 525, "y": 818, "dx": 0.9377487607237036, "dy": -0.34731435582359393 }] },
        { "ville1": "Barcelona", "ville2": "Pamplona", "longueur": 2, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 322.5, "y": 852.5, "dx": 0.09053574604251853, "dy": 0.9958932064677039 }, { "x": 329.5, "y": 917.5, "dx": 0.11781773987828967, "dy": 0.9930352361170129 }] },
        { "ville1": "Berlin", "ville2": "Danzig", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 842.5, "y": 306.5, "dx": 0.1559625734730109, "dy": -0.987762965329069 }, { "x": 867.5, "y": 246.5, "dx": 0.5746304214759497, "dy": -0.8184130245263527 }, { "x": 922.5, "y": 210, "dx": 0.978549784986749, "dy": -0.2060104810498419 }, { "x": 987, "y": 210, "dx": 0.9778024140774094, "dy": 0.20952908873087345 }] },
        { "ville1": "Berlin", "ville2": "Essen", "longueur": 2, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 726.5, "y": 331.5, "dx": 0.9925434552766405, "dy": 0.12189130152520146 }, { "x": 789.5, "y": 339, "dx": 0.9945054529214061, "dy": 0.10468478451804275 }] },
        { "ville1": "Berlin", "ville2": "Frankfurt", "longueur": 3, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 686.5, "y": 452.5, "dx": 0.9173450110960782, "dy": -0.3980931180228264 }, { "x": 743, "y": 424.5, "dx": 0.9012524245251862, "dy": -0.43329443486787794 }, { "x": 800, "y": 397.5, "dx": 0.9012524245251862, "dy": -0.43329443486787794 }] },
        { "ville1": "Berlin", "ville2": "Frankfurt", "longueur": 3, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 676, "y": 432.5, "dx": 0.9012524245251862, "dy": -0.43329443486787794 }, { "x": 734, "y": 405.5, "dx": 0.9084904526785746, "dy": -0.41790560823214434 }, { "x": 790.5, "y": 378, "dx": 0.8909061469019802, "dy": -0.4541874474402252 }] },
        { "ville1": "Berlin", "ville2": "Warszawa", "longueur": 4, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 877, "y": 365.5, "dx": 0.9469787003150827, "dy": -0.3212963447497602 }, { "x": 940, "y": 350.5, "dx": 0.988173903359179, "dy": -0.15333732983159673 }, { "x": 1003, "y": 347, "dx": 0.9993628543475496, "dy": -0.03569153051241249 }, { "x": 1065.5, "y": 350.5, "dx": 0.987762965329069, "dy": 0.1559625734730109 }] },
        { "ville1": "Berlin", "ville2": "Warszawa", "longueur": 4, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 875.5, "y": 341.5, "dx": 0.9486832980505138, "dy": -0.31622776601683794 }, { "x": 939.5, "y": 326.5, "dx": 0.9925434552766405, "dy": -0.12189130152520146 }, { "x": 1002, "y": 322, "dx": 0.9994059993535875, "dy": -0.03446227583977888 }, { "x": 1067, "y": 327, "dx": 0.9906211292434748, "dy": 0.13663739713703102 }] },
        { "ville1": "Berlin", "ville2": "Wien", "longueur": 3, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 847, "y": 408.5, "dx": 0.2890045919356118, "dy": 0.9573277107867141 }, { "x": 870.5, "y": 467, "dx": 0.47514891473488396, "dy": 0.8799053976571926 }, { "x": 906, "y": 520.5, "dx": 0.6246950475544243, "dy": 0.7808688094430304 }] },
        { "ville1": "Brest", "ville2": "Dieppe", "longueur": 2, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 225, "y": 482.5, "dx": 0.8650311892618034, "dy": -0.501718089771846 }, { "x": 287.5, "y": 464, "dx": 0.9977097021176764, "dy": -0.06764133573679162 }] },
        { "ville1": "Brest", "ville2": "Pamplona", "longueur": 4, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 229.5, "y": 549.5, "dx": 0.9342183861793726, "dy": 0.3567015656321241 }, { "x": 280, "y": 591, "dx": 0.5547001962252291, "dy": 0.8320502943378437 }, { "x": 302, "y": 652, "dx": 0.1414213562373095, "dy": 0.9899494936611665 }, { "x": 306, "y": 716, "dx": 0, "dy": 1 }] },
        { "ville1": "Brest", "ville2": "Paris", "longueur": 3, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 235, "y": 521, "dx": 0.9946917938265513, "dy": 0.1028991510855053 }, { "x": 298.5, "y": 529, "dx": 0.9945054529214061, "dy": 0.10468478451804275 }, { "x": 360.5, "y": 536.5, "dx": 0.9964283048969312, "dy": 0.08444307668618062 }] },
        { "ville1": "Brindisi", "ville2": "Palermo", "longueur": 3, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 880.5, "y": 1047.5, "dx": 0.6139406135149205, "dy": -0.7893522173763263 }, { "x": 923, "y": 998.5, "dx": 0.7327934916262993, "dy": -0.6804510993672779 }, { "x": 936.5, "y": 937, "dx": -0.40450601477770304, "dy": -0.9145353377582851 }] },
        { "ville1": "Brindisi", "ville2": "Roma", "longueur": 2, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 832.5, "y": 833, "dx": 0.9902939771518443, "dy": -0.13898862837218867 }, { "x": 892.5, "y": 856, "dx": 0.6610305430689966, "dy": 0.7503589948350772 }] },
        { "ville1": "Bruxelles", "ville2": "Dieppe", "longueur": 2, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 387, "y": 447.5, "dx": 0.8346094065617252, "dy": -0.5508422083307386 }, { "x": 440, "y": 411, "dx": 0.8041761414663255, "dy": -0.5943910610838058 }] },
        { "ville1": "Bruxelles", "ville2": "Frankfurt", "longueur": 2, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 528.5, "y": 403, "dx": 0.9690971739229421, "dy": -0.24667928063493072 }, { "x": 590.5, "y": 420, "dx": 0.7321867381630838, "dy": 0.6811039424772872 }] },
        { "ville1": "Bruxelles", "ville2": "Paris", "longueur": 2, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 432.5, "y": 495, "dx": 0.47312663795681303, "dy": -0.8809944292988933 }, { "x": 462.5, "y": 439, "dx": 0.43329443486787794, "dy": -0.9012524245251862 }] },
        { "ville1": "Bruxelles", "ville2": "Paris", "longueur": 2, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 452.5, "y": 505.5, "dx": 0.4678877204190327, "dy": -0.8837879163470618 }, { "x": 482.5, "y": 449.5, "dx": 0.4678877204190327, "dy": -0.8837879163470618 }] },
        { "ville1": "Bucuresti", "ville2": "Budapest", "longueur": 4, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1058, "y": 613.5, "dx": 0.8944271909999159, "dy": 0.4472135954999579 }, { "x": 1114.5, "y": 644, "dx": 0.8833490206949295, "dy": 0.46871580689935033 }, { "x": 1170, "y": 674, "dx": 0.8872168012345951, "dy": 0.46135273664198945 }, { "x": 1227, "y": 703.5, "dx": 0.8944271909999159, "dy": 0.4472135954999579 }] },
        { "ville1": "Bucuresti", "ville2": "Constantinople", "longueur": 3, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1289.5, "y": 766, "dx": 0.40450601477770304, "dy": 0.9145353377582851 }, { "x": 1314.5, "y": 824, "dx": 0.39186206512519167, "dy": 0.9200239789895804 }, { "x": 1339, "y": 882, "dx": 0.4061384660534476, "dy": 0.9138115486202572 }] },
        { "ville1": "Bucuresti", "ville2": "Kyiv", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1337, "y": 492, "dx": -0.284088329691374, "dy": 0.9587981127083872 }, { "x": 1317.5, "y": 552, "dx": -0.343192952923539, "dy": 0.9392649237907383 }, { "x": 1298, "y": 612.5, "dx": -0.3215824263578902, "dy": 0.9468815887204546 }, { "x": 1278, "y": 672, "dx": -0.3271105638831663, "dy": 0.9449860734402582 }] },
        { "ville1": "Bucuresti", "ville2": "Sevastopol", "longueur": 4, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1307.5, "y": 690.5, "dx": 0.7071067811865476, "dy": -0.7071067811865476 }, { "x": 1365, "y": 657.5, "dx": 0.965948051503245, "dy": -0.2587360852240835 }, { "x": 1430.5, "y": 665, "dx": 0.9040722665053037, "dy": 0.4273796168934163 }, { "x": 1480.5, "y": 705, "dx": 0.6055218324832624, "dy": 0.7958286941208591 }] },
        { "ville1": "Bucuresti", "ville2": "Sofia", "longueur": 2, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1209.5, "y": 809.5, "dx": 0.9582877607731983, "dy": -0.28580512163411176 }, { "x": 1250, "y": 762.5, "dx": 0.13436367297357807, "dy": -0.9909320881801382 }] },
        { "ville1": "Budapest", "ville2": "Kyiv", "longueur": 6, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1037.5, "y": 561, "dx": 0.6633075143158518, "dy": -0.7483469392281404 }, { "x": 1084, "y": 518, "dx": 0.8209052017854871, "dy": -0.5710644881985998 }, { "x": 1139, "y": 483.5, "dx": 0.8799053976571926, "dy": -0.47514891473488396 }, { "x": 1197.5, "y": 459, "dx": 0.9468815887204546, "dy": -0.3215824263578902 }, { "x": 1260, "y": 446, "dx": 0.9974586998307351, "dy": -0.07124704998790965 }, { "x": 1324, "y": 446.5, "dx": 0.9998405993454448, "dy": 0.017854296416882943 }] },
        { "ville1": "Budapest", "ville2": "Sarajevo", "longueur": 3, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1026, "y": 646.5, "dx": 0.14393984571411075, "dy": 0.9895864392845114 }, { "x": 1035, "y": 709, "dx": 0.1757906384836575, "dy": 0.984427575508482 }, { "x": 1044.5, "y": 772, "dx": 0.12403473458920845, "dy": 0.9922778767136676 }] },
        { "ville1": "Budapest", "ville2": "Wien", "longueur": 1, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 973.5, "y": 578, "dx": 0.8528513040762654, "dy": 0.5221538596385299 }] },
        { "ville1": "Budapest", "ville2": "Wien", "longueur": 1, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 962, "y": 596, "dx": 0.8574929257125442, "dy": 0.5144957554275266 }] },
        { "ville1": "Budapest", "ville2": "Zagrab", "longueur": 2, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 987.5, "y": 639, "dx": -0.501718089771846, "dy": 0.8650311892618034 }, { "x": 946.5, "y": 689.5, "dx": -0.7724254859909581, "dy": 0.6351053995925655 }] },
        { "ville1": "Cadiz", "ville2": "Lisboa", "longueur": 2, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 50, "y": 1025.5, "dx": 0.4125075533080444, "dy": 0.9109541802219313 }, { "x": 100, "y": 1063.5, "dx": 0.9812488205210874, "dy": 0.19274530403092788 }] },
        { "ville1": "Cadiz", "ville2": "Madrid", "longueur": 3, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 189, "y": 1062, "dx": 0.9377487607237036, "dy": -0.34731435582359393 }, { "x": 222.5, "y": 1027.5, "dx": -0.3265202527980472, "dy": -0.9451902054680315 }, { "x": 184.5, "y": 976, "dx": -0.7493290854811462, "dy": -0.6621977964717106 }] },
        { "ville1": "Constantinople", "ville2": "Sevastopol", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 2, "segments": [{ "x": 1490.5, "y": 791.5, "dx": -0.017541160386140585, "dy": 0.9998461420100133 }, { "x": 1471, "y": 852.5, "dx": -0.5795237863600037, "dy": 0.8149553245687551 }, { "x": 1428.5, "y": 874, "dx": -0.7938781460016401, "dy": -0.6080768777884903 }, { "x": 1386.5, "y": 896.5, "dx": -0.6139406135149205, "dy": 0.7893522173763263 }] },
        { "ville1": "Constantinople", "ville2": "Smyrna", "longueur": 2, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1301.5, "y": 1026.5, "dx": 0.42661867571297646, "dy": -0.9044315925115101 }, { "x": 1330.5, "y": 968.5, "dx": 0.41110775310681835, "dy": -0.911586756889032 }] },
        { "ville1": "Constantinople", "ville2": "Sofia", "longueur": 3, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1206, "y": 853, "dx": 0.8725060159497201, "dy": 0.48860336893184325 }, { "x": 1262, "y": 883, "dx": 0.879291966536774, "dy": 0.4762831485407526 }, { "x": 1317, "y": 913.5, "dx": 0.8650311892618034, "dy": 0.501718089771846 }] },
        { "ville1": "Danzig", "ville2": "Riga", "longueur": 3, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1041.5, "y": 182.5, "dx": 0.27232246579934893, "dy": -0.9622060458243663 }, { "x": 1071, "y": 125.5, "dx": 0.6028330891856919, "dy": -0.7978673239222394 }, { "x": 1123.5, "y": 89, "dx": 0.9503971290446889, "dy": -0.3110390604146254 }] },
        { "ville1": "Danzig", "ville2": "Warszawa", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1068, "y": 247, "dx": 0.847998304005088, "dy": 0.52999894000318 }, { "x": 1103.5, "y": 299, "dx": 0.22612970719934952, "dy": 0.9740972002433518 }] },
        {
            "ville1": "Dieppe", "ville2": "London", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [
                { "x": 330.5, "y": 419.5, "dx": -0.08738374771484403, "dy": 0.9961747239492219 },
                { "x": 336.5, "y": 358, "dx": -0.08588834215301201, "dy": 0.9963047689749394 }, 
            ]
        },
        { "ville1": "Dieppe", "ville2": "London", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 354.5, "y": 422.5, "dx": 0.08444307668618062, "dy": -0.9964283048969312 }, { "x": 360, "y": 359.5, "dx": 0.10468478451804275, "dy": -0.9945054529214061 }] },
        { "ville1": "Dieppe", "ville2": "Paris", "longueur": 1, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 379.5, "y": 500.5, "dx": 0.7071067811865475, "dy": 0.7071067811865475 }] },
        { "ville1": "Edinburgh", "ville2": "London", "longueur": 4, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 276.5, "y": 96, "dx": 0.42012356811103757, "dy": 0.9074669071198412 }, { "x": 301, "y": 154.5, "dx": 0.38337767164151665, "dy": 0.9235916635000174 }, { "x": 325, "y": 212, "dx": 0.389639990836698, "dy": 0.9209672510685588 }, { "x": 349.5, "y": 269.5, "dx": 0.3980931180228264, "dy": 0.9173450110960782 }] },
        { "ville1": "Edinburgh", "ville2": "London", "longueur": 4, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 255.5, "y": 105.5, "dx": 0.41110775310681835, "dy": 0.911586756889032 }, { "x": 280.5, "y": 163.5, "dx": 0.3980931180228264, "dy": 0.9173450110960782 }, { "x": 305, "y": 220, "dx": 0.40273861426601687, "dy": 0.9153150324227656 }, { "x": 329, "y": 277.5, "dx": 0.3960911114346502, "dy": 0.9182112128712345 }] },
        { "ville1": "Erzurum", "ville2": "Sevastopol", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 2, "segments": [{ "x": 1514, "y": 792, "dx": 0, "dy": 1 }, { "x": 1518.5, "y": 854, "dx": 0.15867809538375516, "dy": 0.9873303712766988 }, { "x": 1542, "y": 914, "dx": 0.5710644881985998, "dy": 0.8209052017854871 }, { "x": 1588.5, "y": 960, "dx": 0.8372705045624257, "dy": 0.546788900938727 }] },
        { "ville1": "Erzurum", "ville2": "Sochi", "longueur": 3, "couleur": "ROUGE", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1653.5, "y": 817, "dx": -0.12403473458920845, "dy": 0.9922778767136676 }, { "x": 1644.5, "y": 880, "dx": -0.15867809538375516, "dy": 0.9873303712766988 }, { "x": 1635.5, "y": 942.5, "dx": -0.12625427967391514, "dy": 0.9919979117236188 }] },
        { "ville1": "Essen", "ville2": "Frankfurt", "longueur": 2, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 666, "y": 412, "dx": 0.8944271909999159, "dy": -0.4472135954999579 }, { "x": 698, "y": 374.5, "dx": -0.4541874474402252, "dy": -0.8909061469019802 }] },
        { "ville1": "Essen", "ville2": "Kobenhavn", "longueur": 3, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 677, "y": 288, "dx": 0.5390536964233673, "dy": -0.8422714006615114 }, { "x": 713, "y": 235, "dx": 0.5547001962252291, "dy": -0.8320502943378437 }, { "x": 748, "y": 182, "dx": 0.5547001962252291, "dy": -0.8320502943378437 }] },
        { "ville1": "Essen", "ville2": "Kobenhavn", "longueur": 3, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 695.5, "y": 300, "dx": 0.5665288228870652, "dy": -0.8240419241993676 }, { "x": 731, "y": 246, "dx": 0.5462677805469223, "dy": -0.8376105968386142 }, { "x": 765.5, "y": 196, "dx": 0.5665288228870652, "dy": -0.8240419241993676 }] },
        { "ville1": "Frankfurt", "ville2": "Munchen", "longueur": 2, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 654, "y": 500, "dx": 0.31622776601683794, "dy": 0.9486832980505138 }, { "x": 684.5, "y": 534.5, "dx": 0.9582877607731983, "dy": -0.28580512163411176 }] },
        { "ville1": "Frankfurt", "ville2": "Paris", "longueur": 3, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 494, "y": 553.5, "dx": 0.9568805766427723, "dy": -0.29048160362369874 }, { "x": 552, "y": 527, "dx": 0.8422714006615114, "dy": -0.5390536964233673 }, { "x": 605.5, "y": 491.5, "dx": 0.8137334712067349, "dy": -0.5812381937190964 }] },
        { "ville1": "Frankfurt", "ville2": "Paris", "longueur": 3, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 482.5, "y": 533, "dx": 0.939793423488437, "dy": -0.3417430630867044 }, { "x": 541, "y": 506.5, "dx": 0.8400393777687709, "dy": -0.5425254314756646 }, { "x": 594, "y": 471.5, "dx": 0.8240419241993676, "dy": -0.5665288228870652 }] },
        { "ville1": "Kharkov", "ville2": "Kyiv", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1386, "y": 482, "dx": 0.34731435582359393, "dy": 0.9377487607237036 }, { "x": 1428, "y": 531, "dx": 0.8804710999221753, "dy": 0.47409982303501746 }, { "x": 1490.5, "y": 547.5, "dx": 0.9986178293325098, "dy": 0.052558833122763673 }, { "x": 1554, "y": 540, "dx": 0.9486832980505138, "dy": -0.31622776601683794 }] },
        { "ville1": "Kharkov", "ville2": "Moskva", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1628.5, "y": 491, "dx": 0.6985367247883851, "dy": -0.7155742058807848 }, { "x": 1661.5, "y": 437, "dx": 0.2676438637860946, "dy": -0.9635179096299405 }, { "x": 1666, "y": 372, "dx": -0.1414213562373095, "dy": -0.9899494936611665 }, { "x": 1647, "y": 309.5, "dx": -0.4541874474402252, "dy": -0.8909061469019802 }] },
        { "ville1": "Kharkov", "ville2": "Rostov", "longueur": 2, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1651, "y": 528, "dx": 1, "dy": 0 }, { "x": 1670.5, "y": 573.5, "dx": 0.017541160386140585, "dy": 0.9998461420100133 }] },
        { "ville1": "Kobenhavn", "ville2": "Stockholm", "longueur": 3, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 808.5, "y": 114, "dx": 0.6804510993672779, "dy": -0.7327934916262993 }, { "x": 855, "y": 70.5, "dx": 0.7483469392281404, "dy": -0.6633075143158518 }, { "x": 908, "y": 34, "dx": 0.8804710999221753, "dy": -0.47409982303501746 }] },
        { "ville1": "Kobenhavn", "ville2": "Stockholm", "longueur": 3, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 825, "y": 132, "dx": 0.6896551724137931, "dy": -0.7241379310344828 }, { "x": 870, "y": 87.5, "dx": 0.7503589948350772, "dy": -0.6610305430689966 }, { "x": 923.5, "y": 50.5, "dx": 0.8837879163470618, "dy": -0.4678877204190327 }] },
        { "ville1": "Kyiv", "ville2": "Smolensk", "longueur": 3, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1418.5, "y": 440.5, "dx": 0.9986178293325098, "dy": 0.052558833122763673 }, { "x": 1477.5, "y": 417, "dx": 0.7157819483772108, "dy": -0.6983238520753277 }, { "x": 1492, "y": 355.5, "dx": -0.2890045919356118, "dy": -0.9573277107867141 }] },
        { "ville1": "Kyiv", "ville2": "Warszawa", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1143.5, "y": 376.5, "dx": 0.689213765997513, "dy": 0.7245580616896932 }, { "x": 1196, "y": 413, "dx": 0.9377487607237036, "dy": 0.34731435582359393 }, { "x": 1258.5, "y": 422.5, "dx": 0.9986178293325098, "dy": -0.052558833122763673 }, { "x": 1322.5, "y": 423.5, "dx": 0.9986178293325098, "dy": 0.052558833122763673 }] },
        { "ville1": "Kyiv", "ville2": "Wilno", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1344, "y": 330.5, "dx": 0.8400393777687709, "dy": 0.5425254314756646 }, { "x": 1372, "y": 389.5, "dx": 0, "dy": 1 }] },
        { "ville1": "Lisboa", "ville2": "Madrid", "longueur": 3, "couleur": "ROSE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 30, "y": 940, "dx": 0, "dy": -1 }, { "x": 49.5, "y": 896, "dx": 0.9994259471398348, "dy": 0.033878845665757114 }, { "x": 111, "y": 917.5, "dx": 0.8080075302163774, "dy": 0.5891721574494418 }] },
        { "ville1": "Madrid", "ville2": "Pamplona", "longueur": 3, "couleur": "BLANC", "isTunnel": true, "ferry": 0, "segments": [{ "x": 186, "y": 920.5, "dx": 0.6419366564593427, "dy": -0.7667576729931038 }, { "x": 229, "y": 874, "dx": 0.7071067811865475, "dy": -0.7071067811865475 }, { "x": 278.5, "y": 833, "dx": 0.8372705045624257, "dy": -0.546788900938727 }] },
        { "ville1": "Madrid", "ville2": "Pamplona", "longueur": 3, "couleur": "NOIR", "isTunnel": true, "ferry": 0, "segments": [{ "x": 171, "y": 905, "dx": 0.6536198703460924, "dy": -0.7568230077691596 }, { "x": 212.5, "y": 857, "dx": 0.6804510993672779, "dy": -0.7327934916262993 }, { "x": 261, "y": 817, "dx": 0.8422714006615114, "dy": -0.5390536964233673 }] },
        { "ville1": "Marseille", "ville2": "Pamplona", "longueur": 4, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 367.5, "y": 823, "dx": 0.9503971290446889, "dy": 0.3110390604146254 }, { "x": 401, "y": 790.5, "dx": 0.35305725243424235, "dy": -0.9356017189507422 }, { "x": 452.5, "y": 753.5, "dx": 0.9998461420100133, "dy": -0.017541160386140585 }, { "x": 516.5, "y": 770.5, "dx": 0.8979207227269799, "dy": 0.44015721702302935 }] },
        { "ville1": "Marseille", "ville2": "Paris", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 553, "y": 756, "dx": -0.5547001962252291, "dy": -0.8320502943378437 }, { "x": 505.5, "y": 713.5, "dx": -0.8837879163470618, "dy": -0.4678877204190327 }, { "x": 457, "y": 670.5, "dx": -0.5700815482062942, "dy": -0.821588113591424 }, { "x": 436.5, "y": 608.5, "dx": -0.054464493159869794, "dy": -0.9985157079309461 }] },
        { "ville1": "Marseille", "ville2": "Roma", "longueur": 4, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 620, "y": 778, "dx": 0.8041761414663255, "dy": -0.5943910610838058 }, { "x": 671, "y": 741.5, "dx": 0.8, "dy": -0.6 }, { "x": 712, "y": 762.5, "dx": 0.6028330891856919, "dy": 0.7978673239222394 }, { "x": 750, "y": 813.5, "dx": 0.6028330891856919, "dy": 0.7978673239222394 }] },
        { "ville1": "Marseille", "ville2": "Zurich", "longueur": 2, "couleur": "ROSE", "isTunnel": true, "ferry": 0, "segments": [{ "x": 615, "y": 683.5, "dx": -0.2553911228370322, "dy": 0.9668378221687647 }, { "x": 599, "y": 746.5, "dx": -0.2890045919356118, "dy": 0.9573277107867141 }] },
        { "ville1": "Moskva", "ville2": "Petrograd", "longueur": 4, "couleur": "BLANC", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1504, "y": 79.5, "dx": 0.9538492507391959, "dy": 0.30028587523270983 }, { "x": 1561, "y": 110, "dx": 0.8041761414663255, "dy": 0.5943910610838058 }, { "x": 1600, "y": 161, "dx": 0.4472135954999579, "dy": 0.8944271909999159 }, { "x": 1617, "y": 222, "dx": 0.07124704998790965, "dy": 0.9974586998307351 }] },
        { "ville1": "Moskva", "ville2": "Smolensk", "longueur": 2, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1526, "y": 314, "dx": 0.994309153919809, "dy": 0.10653312363426524 }, { "x": 1587, "y": 295.5, "dx": 0.8080075302163774, "dy": -0.5891721574494418 }] },
        { "ville1": "Munchen", "ville2": "Venezia", "longueur": 2, "couleur": "BLEU", "isTunnel": true, "ferry": 0, "segments": [{ "x": 742, "y": 587, "dx": 0.18208926018230742, "dy": 0.9832820049844601 }, { "x": 754, "y": 651, "dx": 0.20952908873087345, "dy": 0.9778024140774094 }] },
        { "ville1": "Munchen", "ville2": "Wien", "longueur": 3, "couleur": "ORANGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 768.5, "y": 566, "dx": 0.6055218324832624, "dy": 0.7958286941208591 }, { "x": 826, "y": 594.5, "dx": 0.9986649849421085, "dy": 0.0516550854280401 }, { "x": 887, "y": 574.5, "dx": 0.7792134503124135, "dy": -0.6267586448165066 }] },
        { "ville1": "Munchen", "ville2": "Zurich", "longueur": 2, "couleur": "JAUNE", "isTunnel": true, "ferry": 0, "segments": [{ "x": 656.5, "y": 609.5, "dx": 0.7407190347407712, "dy": -0.6718149384858157 }, { "x": 702.5, "y": 564, "dx": 0.7321867381630838, "dy": -0.6811039424772872 }] },
        {
            "ville1": "Palermo", "ville2": "Roma", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [
                { "x": 864, "y": 1032, "dx": -0.5943910610838058, "dy": 0.8041761414663255 },
                { "x": 884.5, "y": 972, "dx": -0.017238817250844786, "dy": 0.9998514005489976 },
                { "x": 866, "y": 911, "dx": 0.6163082616581107, "dy": 0.7875050010075858 },
                { "x": 818, "y": 867.5, "dx": 0.8799053976571926, "dy": 0.47514891473488396 },
            ]
        },
        {
            "ville1": "Palermo", "ville2": "Smyrna", "longueur": 6, "couleur": "GRIS", "isTunnel": false, "ferry": 2, "segments": [
                { "x": 1236.5, "y": 1069, "dx": 1, "dy": 0 },
                { "x": 1172.5, "y": 1069, "dx": 1, "dy": 0 },
                { "x": 1110.5, "y": 1069, "dx": 1, "dy": 0 },
                { "x": 1048.5, "y": 1069, "dx": 1, "dy": 0 },
                { "x": 984, "y": 1069, "dx": 1, "dy": 0 },
                { "x": 920, "y": 1069, "dx": 1, "dy": 0 },
            ]
        },
        { "ville1": "Pamplona", "ville2": "Paris", "longueur": 4, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 321.5, "y": 763, "dx": 0.5891721574494418, "dy": -0.8080075302163774 }, { "x": 353.5, "y": 706.5, "dx": 0.34570535882735637, "dy": -0.9383431168171101 }, { "x": 374, "y": 647, "dx": 0.24253562503633297, "dy": -0.9701425001453319 }, { "x": 387.5, "y": 584, "dx": 0.15333732983159673, "dy": -0.988173903359179 }] },
        { "ville1": "Pamplona", "ville2": "Paris", "longueur": 4, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 343.5, "y": 770.5, "dx": 0.597266145998167, "dy": -0.8020431103403957 }, { "x": 376, "y": 713, "dx": 0.37729688731351946, "dy": -0.9260923597695477 }, { "x": 397, "y": 654, "dx": 0.27472112789737807, "dy": -0.9615239476408232 }, { "x": 410.5, "y": 592, "dx": 0.11982016019085814, "dy": -0.9927956130099675 }] },
        { "ville1": "Paris", "ville2": "Zurich", "longueur": 3, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 468.5, "y": 594, "dx": 0.5171156399255817, "dy": 0.8559155419457903 }, { "x": 515.5, "y": 636.5, "dx": 0.9052369440730288, "dy": 0.4249071370138707 }, { "x": 578.5, "y": 650, "dx": 1, "dy": 0 }] },
        { "ville1": "Petrograd", "ville2": "Riga", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1216.5, "y": 73, "dx": 1, "dy": 0 }, { "x": 1281, "y": 74, "dx": 0.9993628543475496, "dy": -0.03569153051241249 }, { "x": 1344, "y": 72, "dx": 0.9993148337667671, "dy": -0.037011660509880265 }, { "x": 1407, "y": 71.5, "dx": 0.9985681322700888, "dy": -0.053494721371611896 }] },
        { "ville1": "Petrograd", "ville2": "Stockholm", "longueur": 8, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 994, "y": 57, "dx": 0.6332377902572627, "dy": 0.773957299203321 }, { "x": 1040, "y": 48, "dx": 0.8041761414663255, "dy": -0.5943910610838058 }, { "x": 1099.5, "y": 26.5, "dx": 0.9998347517133227, "dy": 0.01817881366751496 }, { "x": 1163, "y": 26.5, "dx": 0.9998405993454448, "dy": 0.017854296416882943 }, { "x": 1226.5, "y": 25.5, "dx": 0.9998461420100133, "dy": -0.017541160386140585 }, { "x": 1289.5, "y": 26, "dx": 1, "dy": 0 }, { "x": 1352.5, "y": 26.5, "dx": 0.9998347517133227, "dy": -0.01817881366751496 }, { "x": 1416.5, "y": 39, "dx": 0.9165393783696333, "dy": 0.39994445601584 }] },
        { "ville1": "Petrograd", "ville2": "Wilno", "longueur": 4, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1326, "y": 261, "dx": 0.5943910610838058, "dy": -0.8041761414663255 }, { "x": 1364, "y": 209.5, "dx": 0.5627909770820216, "dy": -0.8265992475892192 }, { "x": 1400.5, "y": 158, "dx": 0.5829078754517308, "dy": -0.8125382506296854 }, { "x": 1437, "y": 107.5, "dx": 0.5861197865287227, "dy": -0.8102244107897049 }] },
        { "ville1": "Riga", "ville2": "Wilno", "longueur": 4, "couleur": "VERT", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1167, "y": 119, "dx": -0.16990691650764622, "dy": 0.985460115744348 }, { "x": 1175, "y": 182, "dx": 0.4190581774617469, "dy": 0.9079593845004517 }, { "x": 1216, "y": 230.5, "dx": 0.8559155419457903, "dy": 0.5171156399255817 }, { "x": 1270, "y": 264.5, "dx": 0.8400393777687709, "dy": 0.5425254314756646 }] },
        { "ville1": "Roma", "ville2": "Venezia", "longueur": 2, "couleur": "NOIR", "isTunnel": false, "ferry": 0, "segments": [{ "x": 772.5, "y": 740, "dx": 0.19274530403092788, "dy": 0.9812488205210874 }, { "x": 784, "y": 803.5, "dx": 0.17888543819998318, "dy": 0.9838699100999074 }] },
        { "ville1": "Rostov", "ville2": "Sevastopol", "longueur": 4, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1526, "y": 703, "dx": 0.13663739713703102, "dy": -0.9906211292434748 }, { "x": 1534.5, "y": 640, "dx": 0.15867809538375516, "dy": -0.9873303712766988 }, { "x": 1561, "y": 598, "dx": 0.9906211292434748, "dy": 0.13663739713703102 }, { "x": 1623.5, "y": 609, "dx": 0.9849570246463139, "dy": 0.17279947800812523 }] },
        { "ville1": "Rostov", "ville2": "Sochi", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1667.5, "y": 663, "dx": -0.053494721371611896, "dy": 0.9985681322700888 }, { "x": 1664, "y": 726.5, "dx": -0.07000328148073091, "dy": 0.9975467611004155 }] },
        { "ville1": "Sarajevo", "ville2": "Sofia", "longueur": 2, "couleur": "GRIS", "isTunnel": true, "ferry": 0, "segments": [{ "x": 1096, "y": 793, "dx": 0.9079593845004517, "dy": -0.4190581774617469 }, { "x": 1143.5, "y": 792, "dx": 0.47514891473488396, "dy": 0.8799053976571926 }] },
        { "ville1": "Sarajevo", "ville2": "Zagrab", "longueur": 3, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 913.5, "y": 761.5, "dx": 0.12189130152520146, "dy": 0.9925434552766405 }, { "x": 946, "y": 815.5, "dx": 0.8125382506296854, "dy": 0.5829078754517308 }, { "x": 1010, "y": 825.5, "dx": 0.9433123908373908, "dy": -0.3319062115909338 }] },
        { "ville1": "Sevastopol", "ville2": "Sochi", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 1, "segments": [{ "x": 1554, "y": 753, "dx": 0.9899494936611665, "dy": 0.1414213562373095 }, { "x": 1616, "y": 763, "dx": 0.9899494936611665, "dy": 0.1414213562373095 }] },
        { "ville1": "Smolensk", "ville2": "Wilno", "longueur": 3, "couleur": "JAUNE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1344.5, "y": 274.5, "dx": 0.5812381937190964, "dy": -0.8137334712067349 }, { "x": 1386, "y": 251, "dx": 0.8160244811016552, "dy": 0.5780173407803391 }, { "x": 1438, "y": 289, "dx": 0.8160244811016552, "dy": 0.5780173407803391 }] },
        { "ville1": "Venezia", "ville2": "Zagrab", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 808, "y": 680.5, "dx": 0.965948051503245, "dy": -0.2587360852240835 }, { "x": 870.5, "y": 691.5, "dx": 0.8450788360522153, "dy": 0.5346417126044628 }] },
        { "ville1": "Venezia", "ville2": "Zurich", "longueur": 2, "couleur": "VERT", "isTunnel": true, "ferry": 0, "segments": [{ "x": 664.5, "y": 659.5, "dx": 0.8837879163470618, "dy": 0.4678877204190327 }, { "x": 721.5, "y": 689, "dx": 0.8765785507795943, "dy": 0.48125881219271843 }] },
        { "ville1": "Warszawa", "ville2": "Wien", "longueur": 4, "couleur": "BLEU", "isTunnel": false, "ferry": 0, "segments": [{ "x": 966.5, "y": 531.5, "dx": 0.860576682823999, "dy": -0.5093208939162444 }, { "x": 1016.5, "y": 493.5, "dx": 0.7423931175486519, "dy": -0.6699645207146371 }, { "x": 1059.5, "y": 446, "dx": 0.5891721574494418, "dy": -0.8080075302163774 }, { "x": 1094, "y": 392.5, "dx": 0.5221538596385299, "dy": -0.8528513040762654 }] },
        { "ville1": "Warszawa", "ville2": "Wilno", "longueur": 3, "couleur": "ROUGE", "isTunnel": false, "ferry": 0, "segments": [{ "x": 1142.5, "y": 310.5, "dx": 0.4678877204190327, "dy": -0.8837879163470618 }, { "x": 1194, "y": 272, "dx": 0.9761870601839528, "dy": -0.21693045781865616 }, { "x": 1257, "y": 285, "dx": 0.847998304005088, "dy": 0.52999894000318 }] },
        { "ville1": "Wien", "ville2": "Zagrab", "longueur": 2, "couleur": "GRIS", "isTunnel": false, "ferry": 0, "segments": [{ "x": 912.5, "y": 667, "dx": 0.08588834215301201, "dy": -0.9963047689749394 }, { "x": 916.5, "y": 604.5, "dx": 0.054464493159869794, "dy": -0.9985157079309461 }] }
    ];

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let hostname = window.location.hostname;
    if (hostname === "") {
        hostname = "localhost";
    }

    const ws = writable(new WebSocket(`ws://${hostname}:3232`));

    /* src/Plateau.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1, console: console_1$4 } = globals;
    const file$5 = "src/Plateau.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (106:8) {#each route.segments as segment, i}
    function create_each_block_5(ctx) {
    	let g;
    	let rect;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			attr_dev(rect, "x", -LONGUEUR_SEGMENT / 2);
    			attr_dev(rect, "y", -LARGEUR_SEGMENT / 2);
    			attr_dev(rect, "width", LONGUEUR_SEGMENT);
    			attr_dev(rect, "height", LARGEUR_SEGMENT);
    			add_location(rect, file$5, 111, 12, 2930);
    			attr_dev(g, "class", "segment");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*segment*/ ctx[15].x + ", " + /*segment*/ ctx[15].y + ")\n            rotate(" + Math.atan2(/*segment*/ ctx[15].dy, /*segment*/ ctx[15].dx) * 180 / Math.PI + ")");
    			add_location(g, file$5, 106, 10, 2740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*routes*/ 2 && g_transform_value !== (g_transform_value = "translate(" + /*segment*/ ctx[15].x + ", " + /*segment*/ ctx[15].y + ")\n            rotate(" + Math.atan2(/*segment*/ ctx[15].dy, /*segment*/ ctx[15].dx) * 180 / Math.PI + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(106:8) {#each route.segments as segment, i}",
    		ctx
    	});

    	return block;
    }

    // (101:4) {#each routes as route}
    function create_each_block_4(ctx) {
    	let g;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*route*/ ctx[12].segments;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*route*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "route svelte-1s8m8k5");
    			add_location(g, file$5, 101, 6, 2609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(g, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*routes, Math, LONGUEUR_SEGMENT, LARGEUR_SEGMENT*/ 2) {
    				each_value_5 = /*route*/ ctx[12].segments;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(101:4) {#each routes as route}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#each villes as ville}
    function create_each_block_3(ctx) {
    	let g;
    	let circle;
    	let g_transform_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[5](/*ville*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", "0");
    			attr_dev(circle, "cy", "0");
    			attr_dev(circle, "r", RAYON_VILLE);
    			add_location(circle, file$5, 129, 8, 3376);
    			attr_dev(g, "class", "ville svelte-1s8m8k5");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*ville*/ ctx[9].x + ", " + /*ville*/ ctx[9].y + ")");
    			add_location(g, file$5, 124, 6, 3242);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);

    			if (!mounted) {
    				dispose = listen_dev(g, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*villes*/ 1 && g_transform_value !== (g_transform_value = "translate(" + /*ville*/ ctx[9].x + ", " + /*ville*/ ctx[9].y + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(124:4) {#each villes as ville}",
    		ctx
    	});

    	return block;
    }

    // (150:10) {#if route.proprietaire !== undefined}
    function create_if_block_1(ctx) {
    	let g;
    	let image;
    	let image_xlink_href_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			image = svg_element("image");
    			xlink_attr(image, "xlink:href", image_xlink_href_value = "images/image-wagon-" + /*route*/ ctx[12].proprietaire + ".png");
    			attr_dev(image, "width", TAILLE_WAGON);
    			attr_dev(image, "height", TAILLE_WAGON);
    			attr_dev(image, "transform", "translate(" + -TAILLE_WAGON * 0.55 + ", " + -TAILLE_WAGON / 2 + ")");
    			add_location(image, file$5, 154, 14, 4066);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*segment*/ ctx[15].x + ", " + /*segment*/ ctx[15].y + ")\n              rotate(" + Math.atan2(/*segment*/ ctx[15].dy, /*segment*/ ctx[15].dx) * 180 / Math.PI + ")");
    			add_location(g, file$5, 150, 12, 3896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, image);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*routes*/ 2 && image_xlink_href_value !== (image_xlink_href_value = "images/image-wagon-" + /*route*/ ctx[12].proprietaire + ".png")) {
    				xlink_attr(image, "xlink:href", image_xlink_href_value);
    			}

    			if (dirty & /*routes*/ 2 && g_transform_value !== (g_transform_value = "translate(" + /*segment*/ ctx[15].x + ", " + /*segment*/ ctx[15].y + ")\n              rotate(" + Math.atan2(/*segment*/ ctx[15].dy, /*segment*/ ctx[15].dx) * 180 / Math.PI + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(150:10) {#if route.proprietaire !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (149:8) {#each route.segments as segment, i}
    function create_each_block_2$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*route*/ ctx[12].proprietaire !== undefined && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*route*/ ctx[12].proprietaire !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(149:8) {#each route.segments as segment, i}",
    		ctx
    	});

    	return block;
    }

    // (147:4) {#each routes as route}
    function create_each_block_1$2(ctx) {
    	let g;
    	let each_value_2 = /*route*/ ctx[12].segments;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "no-pointer svelte-1s8m8k5");
    			add_location(g, file$5, 147, 6, 3767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*routes, Math, TAILLE_WAGON, undefined*/ 2) {
    				each_value_2 = /*route*/ ctx[12].segments;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(147:4) {#each routes as route}",
    		ctx
    	});

    	return block;
    }

    // (169:6) {#if ville.proprietaire !== undefined}
    function create_if_block$3(ctx) {
    	let g;
    	let image0;
    	let image1;
    	let image1_xlink_href_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			image0 = svg_element("image");
    			image1 = svg_element("image");
    			xlink_attr(image0, "xlink:href", "images/gare-shadow.png");
    			attr_dev(image0, "width", TAILLE_GARE * 1.05);
    			attr_dev(image0, "height", TAILLE_GARE * 1.05);
    			attr_dev(image0, "transform", "translate(" + -TAILLE_GARE * 0.55 + ", " + -TAILLE_GARE * 0.75 + ")");
    			add_location(image0, file$5, 170, 10, 4601);
    			xlink_attr(image1, "xlink:href", image1_xlink_href_value = "images/gare-" + /*ville*/ ctx[9].proprietaire + ".png");
    			attr_dev(image1, "width", TAILLE_GARE);
    			attr_dev(image1, "height", TAILLE_GARE);
    			attr_dev(image1, "transform", "translate(" + -TAILLE_GARE * 0.6 + ", " + -TAILLE_GARE * 0.7 + ")");
    			add_location(image1, file$5, 176, 10, 4838);
    			attr_dev(g, "class", "no-pointer svelte-1s8m8k5");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*ville*/ ctx[9].x + ", " + /*ville*/ ctx[9].y + ")");
    			add_location(g, file$5, 169, 8, 4524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, image0);
    			append_dev(g, image1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*villes*/ 1 && image1_xlink_href_value !== (image1_xlink_href_value = "images/gare-" + /*ville*/ ctx[9].proprietaire + ".png")) {
    				xlink_attr(image1, "xlink:href", image1_xlink_href_value);
    			}

    			if (dirty & /*villes*/ 1 && g_transform_value !== (g_transform_value = "translate(" + /*ville*/ ctx[9].x + ", " + /*ville*/ ctx[9].y + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(169:6) {#if ville.proprietaire !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (168:4) {#each villes as ville}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*ville*/ ctx[9].proprietaire !== undefined && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*ville*/ ctx[9].proprietaire !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(168:4) {#each villes as ville}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let svg;
    	let each0_anchor;
    	let rect;
    	let each2_anchor;
    	let image;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*routes*/ ctx[1];
    	validate_each_argument(each_value_4);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*villes*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*routes*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*villes*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			each2_anchor = empty();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			image = svg_element("image");
    			attr_dev(rect, "id", "cache");
    			attr_dev(rect, "class", "no-pointer svelte-1s8m8k5");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "1701");
    			attr_dev(rect, "height", "1097");
    			attr_dev(rect, "fill", "#fffc");
    			set_style(rect, "visibility", "hidden");
    			add_location(rect, file$5, 134, 4, 3514);
    			xlink_attr(image, "xlink:href", "images/toggle-button.png");
    			attr_dev(image, "x", "0");
    			attr_dev(image, "y", "0");
    			attr_dev(image, "width", "80");
    			attr_dev(image, "height", "80");
    			add_location(image, file$5, 187, 4, 5153);
    			attr_dev(svg, "id", "board");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 1701 1097");
    			attr_dev(svg, "class", "svelte-1s8m8k5");
    			add_location(svg, file$5, 93, 2, 2406);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(svg, null);
    			}

    			append_dev(svg, each0_anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(svg, null);
    			}

    			append_dev(svg, rect);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg, null);
    			}

    			append_dev(svg, each2_anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append_dev(svg, image);

    			if (!mounted) {
    				dispose = listen_dev(image, "click", toggleTracks, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*send, routes, Math, LONGUEUR_SEGMENT, LARGEUR_SEGMENT*/ 6) {
    				each_value_4 = /*routes*/ ctx[1];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(svg, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_4.length;
    			}

    			if (dirty & /*villes, send, RAYON_VILLE*/ 5) {
    				each_value_3 = /*villes*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(svg, rect);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*routes, Math, TAILLE_WAGON, undefined*/ 2) {
    				each_value_1 = /*routes*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg, each2_anchor);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*villes, TAILLE_GARE, undefined*/ 1) {
    				each_value = /*villes*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, image);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const LONGUEUR_SEGMENT = 60;
    const LARGEUR_SEGMENT = 20;
    const TAILLE_WAGON = 70;
    const TAILLE_GARE = 50;
    const RAYON_VILLE = 12;

    function toggleTracks() {
    	const cache = document.getElementById("cache");

    	if (cache.style.visibility === "hidden") {
    		cache.style.visibility = "";
    	} else {
    		cache.style.visibility = "hidden";
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $ws;
    	validate_store(ws, 'ws');
    	component_subscribe($$self, ws, $$value => $$invalidate(6, $ws = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Plateau', slots, []);
    	let { props } = $$props;

    	function send(message) {
    		console.log(`Message: "${message}"`);
    		$ws.send(message);
    	}

    	class Ville {
    		constructor(nom, x, y) {
    			this.nom = nom;
    			this.x = x;
    			this.y = y;
    			this.proprietaire = undefined;
    		}
    	}

    	class Route {
    		constructor(ville1, ville2, longueur, couleur, isTunnel, ferry, segments) {
    			this.ville1 = ville1;
    			this.ville2 = ville2;
    			this.longueur = longueur;
    			this.couleur = couleur;
    			this.isTunnel = isTunnel;
    			this.ferry = ferry;
    			this.label = `${ville1} - ${ville2}`;
    			this.segments = segments;
    			this.proprietaire = undefined;
    		}
    	}

    	const villes = Object.values(villesData).map(data => new Ville(data.nom, data.x, data.y));
    	const routes = routesData.map(data => new Route(data.ville1, data.ville2, data.longueur, data.couleur, data.isTunnel, data.ferry, data.segments));

    	// Corriger les labels des routes multiples
    	for (let i = 0; i < routes.length - 1; i++) {
    		if (routes[i].label === routes[i + 1].label) {
    			routes[i].label += "(1)";
    			routes[i + 1].label += "(2)";
    		}
    	}

    	beforeUpdate(() => {
    		for (const routeData of props.routes) {
    			if (routeData.proprietaire) {
    				routes.filter(r => r.label === routeData.nom)[0].proprietaire = routeData.proprietaire;
    			}
    		}

    		for (const villeData of props.villes) {
    			if (villeData.proprietaire) {
    				villes.filter(v => v.nom === villeData.nom)[0].proprietaire = villeData.proprietaire;
    			}
    		}

    		$$invalidate(1, routes);
    		$$invalidate(0, villes);
    	});

    	const writable_props = ['props'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Plateau> was created with unknown prop '${key}'`);
    	});

    	const click_handler = route => send(route.label);
    	const click_handler_1 = ville => send(ville.nom);

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(3, props = $$props.props);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		villesData,
    		routesData,
    		ws,
    		props,
    		LONGUEUR_SEGMENT,
    		LARGEUR_SEGMENT,
    		TAILLE_WAGON,
    		TAILLE_GARE,
    		RAYON_VILLE,
    		toggleTracks,
    		send,
    		Ville,
    		Route,
    		villes,
    		routes,
    		$ws
    	});

    	$$self.$inject_state = $$props => {
    		if ('props' in $$props) $$invalidate(3, props = $$props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [villes, routes, send, props, click_handler, click_handler_1];
    }

    class Plateau extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { props: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plateau",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[3] === undefined && !('props' in props)) {
    			console_1$4.warn("<Plateau> was created without expected prop 'props'");
    		}
    	}

    	get props() {
    		throw new Error("<Plateau>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Plateau>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Joueur.svelte generated by Svelte v3.46.4 */

    const { console: console_1$3 } = globals;
    const file$4 = "src/Joueur.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (27:12) {#each props.destinations as destination}
    function create_each_block_2(ctx) {
    	let div;
    	let t0_value = /*destination*/ ctx[10].ville1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*destination*/ ctx[10].ville2 + "";
    	let t2;
    	let t3;
    	let t4_value = /*destination*/ ctx[10].valeur + "";
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*destination*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = text(" (");
    			t4 = text(t4_value);
    			t5 = text(")\n                ");
    			attr_dev(div, "class", "destination");
    			add_location(div, file$4, 27, 16, 866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*props*/ 1 && t0_value !== (t0_value = /*destination*/ ctx[10].ville1 + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*props*/ 1 && t2_value !== (t2_value = /*destination*/ ctx[10].ville2 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*props*/ 1 && t4_value !== (t4_value = /*destination*/ ctx[10].valeur + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(27:12) {#each props.destinations as destination}",
    		ctx
    	});

    	return block;
    }

    // (37:12) {#each props.cartesWagon as wagon}
    function create_each_block_1$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[3](/*wagon*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			attr_dev(div0, "class", "image-wagon svelte-vqlws6");
    			set_style(div0, "background-image", "url(images/carte-wagon-" + /*wagon*/ ctx[5] + ".png");
    			add_location(div0, file$4, 41, 20, 1371);
    			attr_dev(div1, "class", div1_class_value = "carte-wagon " + /*wagon*/ ctx[5] + " svelte-vqlws6");
    			add_location(div1, file$4, 37, 16, 1231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*props*/ 1) {
    				set_style(div0, "background-image", "url(images/carte-wagon-" + /*wagon*/ ctx[5] + ".png");
    			}

    			if (dirty & /*props*/ 1 && div1_class_value !== (div1_class_value = "carte-wagon " + /*wagon*/ ctx[5] + " svelte-vqlws6")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(37:12) {#each props.cartesWagon as wagon}",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#each props.cartesWagonPosees as wagon}
    function create_each_block$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			attr_dev(div0, "class", "image-wagon svelte-vqlws6");
    			set_style(div0, "background-image", "url(images/carte-wagon-" + /*wagon*/ ctx[5] + ".png");
    			add_location(div0, file$4, 51, 20, 1744);
    			attr_dev(div1, "class", "overlay svelte-vqlws6");
    			add_location(div1, file$4, 55, 20, 1921);
    			attr_dev(div2, "class", div2_class_value = "carte-wagon " + /*wagon*/ ctx[5] + " svelte-vqlws6");
    			add_location(div2, file$4, 50, 16, 1690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 1) {
    				set_style(div0, "background-image", "url(images/carte-wagon-" + /*wagon*/ ctx[5] + ".png");
    			}

    			if (dirty & /*props*/ 1 && div2_class_value !== (div2_class_value = "carte-wagon " + /*wagon*/ ctx[5] + " svelte-vqlws6")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(50:12) {#each props.cartesWagonPosees as wagon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div9;
    	let div4;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let div3;
    	let span;
    	let t1_value = /*props*/ ctx[0].nom + "";
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let t4_value = /*props*/ ctx[0].score + "";
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let t7_value = /*props*/ ctx[0].nbGares + "";
    	let t7;
    	let t8;
    	let div2;
    	let t9;
    	let t10_value = /*props*/ ctx[0].nbWagons + "";
    	let t10;
    	let t11;
    	let div8;
    	let div5;
    	let t12;
    	let div6;
    	let t13;
    	let div7;
    	let div9_class_value;
    	let each_value_2 = /*props*/ ctx[0].destinations;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*props*/ ctx[0].cartesWagon;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*props*/ ctx[0].cartesWagonPosees;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div4 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			t3 = text("Score: ");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Gares: ");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			t9 = text("Wagons: ");
    			t10 = text(t10_value);
    			t11 = space();
    			div8 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t12 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t13 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(img, "class", "avatar svelte-vqlws6");
    			attr_dev(img, "alt", img_alt_value = "avatar " + /*props*/ ctx[0].couleur);
    			if (!src_url_equal(img.src, img_src_value = "images/avatar-" + /*props*/ ctx[0].couleur + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$4, 12, 8, 303);
    			attr_dev(span, "class", "nom svelte-vqlws6");
    			add_location(span, file$4, 18, 12, 485);
    			attr_dev(div0, "class", "score");
    			add_location(div0, file$4, 19, 12, 534);
    			attr_dev(div1, "class", "gares");
    			add_location(div1, file$4, 20, 12, 592);
    			attr_dev(div2, "class", "wagons");
    			add_location(div2, file$4, 21, 12, 652);
    			attr_dev(div3, "class", "info column svelte-vqlws6");
    			add_location(div3, file$4, 17, 8, 447);
    			attr_dev(div4, "class", "header row svelte-vqlws6");
    			add_location(div4, file$4, 11, 4, 270);
    			attr_dev(div5, "class", "destinations column svelte-vqlws6");
    			add_location(div5, file$4, 25, 8, 762);
    			attr_dev(div6, "class", "cartes-wagon svelte-vqlws6");
    			add_location(div6, file$4, 35, 8, 1141);
    			attr_dev(div7, "class", "cartes-wagon svelte-vqlws6");
    			add_location(div7, file$4, 48, 8, 1594);
    			attr_dev(div8, "class", "secret svelte-vqlws6");
    			add_location(div8, file$4, 24, 4, 733);
    			attr_dev(div9, "class", div9_class_value = "joueur " + /*props*/ ctx[0].couleur + " " + (/*props*/ ctx[0].estJoueurCourant ? 'actif' : '') + " svelte-vqlws6");
    			add_location(div9, file$4, 10, 0, 189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div4);
    			append_dev(div4, img);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, span);
    			append_dev(span, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div0);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, t6);
    			append_dev(div1, t7);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div8, div5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div5, null);
    			}

    			append_dev(div8, t12);
    			append_dev(div8, div6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div6, null);
    			}

    			append_dev(div8, t13);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*props*/ 1 && img_alt_value !== (img_alt_value = "avatar " + /*props*/ ctx[0].couleur)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*props*/ 1 && !src_url_equal(img.src, img_src_value = "images/avatar-" + /*props*/ ctx[0].couleur + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*props*/ 1 && t1_value !== (t1_value = /*props*/ ctx[0].nom + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*props*/ 1 && t4_value !== (t4_value = /*props*/ ctx[0].score + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*props*/ 1 && t7_value !== (t7_value = /*props*/ ctx[0].nbGares + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*props*/ 1 && t10_value !== (t10_value = /*props*/ ctx[0].nbWagons + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*send, props*/ 3) {
    				each_value_2 = /*props*/ ctx[0].destinations;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*props, send*/ 3) {
    				each_value_1 = /*props*/ ctx[0].cartesWagon;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*props*/ 1) {
    				each_value = /*props*/ ctx[0].cartesWagonPosees;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div7, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*props*/ 1 && div9_class_value !== (div9_class_value = "joueur " + /*props*/ ctx[0].couleur + " " + (/*props*/ ctx[0].estJoueurCourant ? 'actif' : '') + " svelte-vqlws6")) {
    				attr_dev(div9, "class", div9_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $ws;
    	validate_store(ws, 'ws');
    	component_subscribe($$self, ws, $$value => $$invalidate(4, $ws = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Joueur', slots, []);
    	let { props } = $$props;

    	function send(message) {
    		console.log(`Message: "${message}"`);
    		$ws.send(message);
    	}

    	const writable_props = ['props'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Joueur> was created with unknown prop '${key}'`);
    	});

    	const click_handler = destination => send(destination.nom);
    	const click_handler_1 = wagon => send(wagon);

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    	};

    	$$self.$capture_state = () => ({ ws, props, send, $ws });

    	$$self.$inject_state = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [props, send, click_handler, click_handler_1];
    }

    class Joueur extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { props: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Joueur",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !('props' in props)) {
    			console_1$3.warn("<Joueur> was created without expected prop 'props'");
    		}
    	}

    	get props() {
    		throw new Error("<Joueur>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Joueur>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Prompt.svelte generated by Svelte v3.46.4 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/Prompt.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (17:8) {#each props.boutons as bouton}
    function create_each_block$3(ctx) {
    	let button;
    	let t_value = /*bouton*/ ctx[5] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*bouton*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 17, 12, 415);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*props*/ 1 && t_value !== (t_value = /*bouton*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:8) {#each props.boutons as bouton}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {:else}
    function create_else_block$2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Passer";
    			button.disabled = true;
    			add_location(button, file$3, 26, 12, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(26:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:8) {#if props.peutPasser}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Passer";
    			add_location(button, file$3, 24, 12, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(24:8) {#if props.peutPasser}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t0_value = /*props*/ ctx[0].nomJoueurCourant + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*props*/ ctx[0].instruction + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let each_value = /*props*/ ctx[0].boutons;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*props*/ ctx[0].peutPasser) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if_block.c();
    			attr_dev(span, "class", "nom-joueur svelte-19y2w7e");
    			add_location(span, file$3, 12, 4, 244);
    			attr_dev(div0, "class", "instruction");
    			add_location(div0, file$3, 11, 4, 214);
    			attr_dev(div1, "class", "boutons");
    			add_location(div1, file$3, 15, 4, 341);
    			attr_dev(div2, "class", "prompt");
    			add_location(div2, file$3, 10, 0, 189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t5);
    			if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*props*/ 1 && t0_value !== (t0_value = /*props*/ ctx[0].nomJoueurCourant + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*props*/ 1 && t3_value !== (t3_value = /*props*/ ctx[0].instruction + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*send, props*/ 3) {
    				each_value = /*props*/ ctx[0].boutons;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $ws;
    	validate_store(ws, 'ws');
    	component_subscribe($$self, ws, $$value => $$invalidate(4, $ws = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Prompt', slots, []);
    	let { props } = $$props;

    	function send(message) {
    		console.log(`Message: "${message}"`);
    		$ws.send(message);
    	}

    	const writable_props = ['props'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Prompt> was created with unknown prop '${key}'`);
    	});

    	const click_handler = bouton => send(bouton);
    	const click_handler_1 = () => send("");

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    	};

    	$$self.$capture_state = () => ({ props, ws, send, $ws });

    	$$self.$inject_state = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [props, send, click_handler, click_handler_1];
    }

    class Prompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { props: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prompt",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !('props' in props)) {
    			console_1$2.warn("<Prompt> was created without expected prop 'props'");
    		}
    	}

    	get props() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Log.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/Log.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (15:8) {#each lines as line}
    function create_each_block$2(ctx) {
    	let pre;
    	let raw_value = /*line*/ ctx[1] + "";

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			attr_dev(pre, "class", "svelte-1r9y78z");
    			add_location(pre, file$2, 15, 12, 360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			pre.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lines*/ 1 && raw_value !== (raw_value = /*line*/ ctx[1] + "")) pre.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:8) {#each lines as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*lines*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "id", "inner-log");
    			attr_dev(div0, "class", "svelte-1r9y78z");
    			add_location(div0, file$2, 13, 4, 297);
    			attr_dev(div1, "id", "log");
    			attr_dev(div1, "class", "svelte-1r9y78z");
    			add_location(div1, file$2, 12, 0, 278);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lines*/ 1) {
    				each_value = /*lines*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollToBottom() {
    	const logElement = document.getElementById("inner-log");
    	logElement.scrollTop = logElement.scrollHeight;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Log', slots, []);
    	let { lines } = $$props;
    	afterUpdate(scrollToBottom);
    	const writable_props = ['lines'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Log> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('lines' in $$props) $$invalidate(0, lines = $$props.lines);
    	};

    	$$self.$capture_state = () => ({ afterUpdate, lines, scrollToBottom });

    	$$self.$inject_state = $$props => {
    		if ('lines' in $$props) $$invalidate(0, lines = $$props.lines);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lines];
    }

    class Log extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { lines: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Log",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lines*/ ctx[0] === undefined && !('lines' in props)) {
    			console.warn("<Log> was created without expected prop 'lines'");
    		}
    	}

    	get lines() {
    		throw new Error("<Log>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lines(value) {
    		throw new Error("<Log>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Piles.svelte generated by Svelte v3.46.4 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Piles.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (16:12) {#each props.cartesWagonVisibles as couleur}
    function create_each_block_1(ctx) {
    	let div;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let span;
    	let t1_value = /*couleur*/ ctx[7][0] + /*couleur*/ ctx[7].slice(1).toLowerCase() + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*couleur*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(img, "class", "shadow svelte-1eir9gx");
    			attr_dev(img, "alt", img_alt_value = /*couleur*/ ctx[7]);
    			if (!src_url_equal(img.src, img_src_value = "images/carte-wagon-" + /*couleur*/ ctx[7] + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 17, 20, 479);
    			add_location(span, file$1, 23, 20, 722);
    			attr_dev(div, "class", "carte visible column svelte-1eir9gx");
    			add_location(div, file$1, 16, 16, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*props*/ 1 && img_alt_value !== (img_alt_value = /*couleur*/ ctx[7])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*props*/ 1 && !src_url_equal(img.src, img_src_value = "images/carte-wagon-" + /*couleur*/ ctx[7] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*props*/ 1 && t1_value !== (t1_value = /*couleur*/ ctx[7][0] + /*couleur*/ ctx[7].slice(1).toLowerCase() + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(16:12) {#each props.cartesWagonVisibles as couleur}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let each_value = /*props*/ ctx[0].defausseCartesWagon.slice(-15);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "defausse-cartes-wagon");
    			attr_dev(div, "class", "carte column svelte-1eir9gx");
    			add_location(div, file$1, 42, 12, 1317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 1) {
    				each_value = /*props*/ ctx[0].defausseCartesWagon.slice(-15);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#if props.defausseCartesWagon.length === 0}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "carte-stub svelte-1eir9gx");
    			add_location(div, file$1, 40, 12, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:8) {#if props.defausseCartesWagon.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (44:16) {#each props.defausseCartesWagon.slice(-15) as couleur}
    function create_each_block$1(ctx) {
    	let img;
    	let img_alt_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "shadow svelte-1eir9gx");
    			attr_dev(img, "alt", img_alt_value = /*couleur*/ ctx[7]);
    			if (!src_url_equal(img.src, img_src_value = "images/carte-wagon-" + /*couleur*/ ctx[7] + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 44, 20, 1463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 1 && img_alt_value !== (img_alt_value = /*couleur*/ ctx[7])) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*props*/ 1 && !src_url_equal(img.src, img_src_value = "images/carte-wagon-" + /*couleur*/ ctx[7] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(44:16) {#each props.defausseCartesWagon.slice(-15) as couleur}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let t0;
    	let log;
    	let t1;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let span0;
    	let t3;
    	let t4_value = /*props*/ ctx[0].pileCartesWagon + "";
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let t7;
    	let span1;
    	let t8;
    	let t9_value = /*props*/ ctx[0].defausseCartesWagon.length + "";
    	let t9;
    	let t10;
    	let t11;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let span2;
    	let t13;
    	let t14_value = /*props*/ ctx[0].pileDestinations + "";
    	let t14;
    	let t15;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*props*/ ctx[0].cartesWagonVisibles;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	log = new Log({
    			props: { lines: /*logLines*/ ctx[1] },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*props*/ ctx[0].defausseCartesWagon.length === 0) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			create_component(log.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			img0 = element("img");
    			t2 = space();
    			span0 = element("span");
    			t3 = text("Cartes wagon (");
    			t4 = text(t4_value);
    			t5 = text(")");
    			t6 = space();
    			div3 = element("div");
    			if_block.c();
    			t7 = space();
    			span1 = element("span");
    			t8 = text("Défausse (");
    			t9 = text(t9_value);
    			t10 = text(")");
    			t11 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t12 = space();
    			span2 = element("span");
    			t13 = text("Destinations (");
    			t14 = text(t14_value);
    			t15 = text(")");
    			attr_dev(div0, "id", "cartes-visibles");
    			attr_dev(div0, "class", "row svelte-1eir9gx");
    			add_location(div0, file$1, 14, 8, 312);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$1, 13, 4, 283);
    			attr_dev(img0, "class", "shadow svelte-1eir9gx");
    			attr_dev(img0, "alt", "wagon");
    			if (!src_url_equal(img0.src, img0_src_value = "images/carte-wagon.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$1, 30, 8, 945);
    			add_location(span0, file$1, 36, 8, 1103);
    			attr_dev(div2, "id", "pile-cartes-wagon");
    			attr_dev(div2, "class", "carte column svelte-1eir9gx");
    			add_location(div2, file$1, 29, 4, 887);
    			add_location(span1, file$1, 52, 8, 1696);
    			attr_dev(div3, "class", "carte column svelte-1eir9gx");
    			add_location(div3, file$1, 38, 4, 1170);
    			attr_dev(img1, "class", "shadow svelte-1eir9gx");
    			attr_dev(img1, "alt", "destinations");
    			if (!src_url_equal(img1.src, img1_src_value = "images/eu_TicketBack.png")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$1, 55, 8, 1828);
    			add_location(span2, file$1, 61, 8, 2003);
    			attr_dev(div4, "id", "pile-destinations");
    			attr_dev(div4, "class", "carte column svelte-1eir9gx");
    			add_location(div4, file$1, 54, 4, 1770);
    			attr_dev(div5, "id", "piles");
    			attr_dev(div5, "class", "row svelte-1eir9gx");
    			add_location(div5, file$1, 12, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t0);
    			mount_component(log, div1, null);
    			append_dev(div5, t1);
    			append_dev(div5, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t2);
    			append_dev(div2, span0);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(span0, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			if_block.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, span1);
    			append_dev(span1, t8);
    			append_dev(span1, t9);
    			append_dev(span1, t10);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(div4, t12);
    			append_dev(div4, span2);
    			append_dev(span2, t13);
    			append_dev(span2, t14);
    			append_dev(span2, t15);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(img1, "click", /*click_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*props, send*/ 5) {
    				each_value_1 = /*props*/ ctx[0].cartesWagonVisibles;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			const log_changes = {};
    			if (dirty & /*logLines*/ 2) log_changes.lines = /*logLines*/ ctx[1];
    			log.$set(log_changes);
    			if ((!current || dirty & /*props*/ 1) && t4_value !== (t4_value = /*props*/ ctx[0].pileCartesWagon + "")) set_data_dev(t4, t4_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, t7);
    				}
    			}

    			if ((!current || dirty & /*props*/ 1) && t9_value !== (t9_value = /*props*/ ctx[0].defausseCartesWagon.length + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*props*/ 1) && t14_value !== (t14_value = /*props*/ ctx[0].pileDestinations + "")) set_data_dev(t14, t14_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(log.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(log.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			destroy_component(log);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $ws;
    	validate_store(ws, 'ws');
    	component_subscribe($$self, ws, $$value => $$invalidate(6, $ws = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Piles', slots, []);
    	let { props } = $$props;
    	let { logLines } = $$props;

    	function send(message) {
    		console.log(`Message: "${message}"`);
    		$ws.send(message);
    	}

    	const writable_props = ['props', 'logLines'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Piles> was created with unknown prop '${key}'`);
    	});

    	const click_handler = couleur => send(couleur);
    	const click_handler_1 = () => send("GRIS");
    	const click_handler_2 = () => send("destinations");

    	$$self.$$set = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('logLines' in $$props) $$invalidate(1, logLines = $$props.logLines);
    	};

    	$$self.$capture_state = () => ({ ws, Log, props, logLines, send, $ws });

    	$$self.$inject_state = $$props => {
    		if ('props' in $$props) $$invalidate(0, props = $$props.props);
    		if ('logLines' in $$props) $$invalidate(1, logLines = $$props.logLines);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [props, logLines, send, click_handler, click_handler_1, click_handler_2];
    }

    class Piles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { props: 0, logLines: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Piles",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*props*/ ctx[0] === undefined && !('props' in props)) {
    			console_1$1.warn("<Piles> was created without expected prop 'props'");
    		}

    		if (/*logLines*/ ctx[1] === undefined && !('logLines' in props)) {
    			console_1$1.warn("<Piles> was created without expected prop 'logLines'");
    		}
    	}

    	get props() {
    		throw new Error("<Piles>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Piles>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get logLines() {
    		throw new Error("<Piles>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set logLines(value) {
    		throw new Error("<Piles>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (31:0) {:else}
    function create_else_block(ctx) {
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "La connexion avec le serveur n'a pas pu être établie.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Démarrez le serveur et rechargez la page.";
    			add_location(p0, file, 31, 2, 705);
    			add_location(p1, file, 32, 2, 768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(31:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if data}
    function create_if_block(ctx) {
    	let main;
    	let div1;
    	let plateau;
    	let t0;
    	let div0;
    	let prompt;
    	let t1;
    	let piles;
    	let t2;
    	let div2;
    	let current;

    	plateau = new Plateau({
    			props: {
    				props: {
    					villes: /*data*/ ctx[0].villes,
    					routes: /*data*/ ctx[0].routes
    				}
    			},
    			$$inline: true
    		});

    	prompt = new Prompt({
    			props: { props: /*data*/ ctx[0].prompt },
    			$$inline: true
    		});

    	piles = new Piles({
    			props: {
    				props: /*data*/ ctx[0].piles,
    				logLines: /*data*/ ctx[0].log
    			},
    			$$inline: true
    		});

    	let each_value = /*data*/ ctx[0].joueurs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			create_component(plateau.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(prompt.$$.fragment);
    			t1 = space();
    			create_component(piles.$$.fragment);
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div0, file, 19, 6, 445);
    			attr_dev(div1, "id", "main");
    			add_location(div1, file, 17, 4, 354);
    			attr_dev(div2, "class", "joueurs svelte-urompm");
    			add_location(div2, file, 24, 4, 575);
    			attr_dev(main, "class", "svelte-urompm");
    			add_location(main, file, 16, 2, 343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(plateau, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(prompt, div0, null);
    			append_dev(div0, t1);
    			mount_component(piles, div0, null);
    			append_dev(main, t2);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const plateau_changes = {};

    			if (dirty & /*data*/ 1) plateau_changes.props = {
    				villes: /*data*/ ctx[0].villes,
    				routes: /*data*/ ctx[0].routes
    			};

    			plateau.$set(plateau_changes);
    			const prompt_changes = {};
    			if (dirty & /*data*/ 1) prompt_changes.props = /*data*/ ctx[0].prompt;
    			prompt.$set(prompt_changes);
    			const piles_changes = {};
    			if (dirty & /*data*/ 1) piles_changes.props = /*data*/ ctx[0].piles;
    			if (dirty & /*data*/ 1) piles_changes.logLines = /*data*/ ctx[0].log;
    			piles.$set(piles_changes);

    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].joueurs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plateau.$$.fragment, local);
    			transition_in(prompt.$$.fragment, local);
    			transition_in(piles.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plateau.$$.fragment, local);
    			transition_out(prompt.$$.fragment, local);
    			transition_out(piles.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(plateau);
    			destroy_component(prompt);
    			destroy_component(piles);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(16:0) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#each data.joueurs as props}
    function create_each_block(ctx) {
    	let joueur;
    	let current;

    	joueur = new Joueur({
    			props: { props: /*props*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(joueur.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(joueur, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const joueur_changes = {};
    			if (dirty & /*data*/ 1) joueur_changes.props = /*props*/ ctx[2];
    			joueur.$set(joueur_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(joueur.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(joueur.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(joueur, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:6) {#each data.joueurs as props}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $ws;
    	validate_store(ws, 'ws');
    	component_subscribe($$self, ws, $$value => $$invalidate(1, $ws = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let data;

    	set_store_value(
    		ws,
    		$ws.onmessage = function (event) {
    			$$invalidate(0, data = JSON.parse(event.data));
    			console.log(data);
    		},
    		$ws
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Plateau,
    		Joueur,
    		Prompt,
    		Piles,
    		ws,
    		data,
    		$ws
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
