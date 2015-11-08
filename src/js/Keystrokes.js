// adapted from this jsfiddle http://jsfiddle.net/7C76W/ by stack overflow user Flambino from
// http://stackoverflow.com/questions/7251956/detecting-command-keystroke-in-safari

var ESC   = 27,
    CMD   = 8,
    SHIFT = 4,
    ALT   = 2,
    CTRL  = 1;

var modifiers = 0;

function modifierCode(event) {
    switch (event.keyCode) {
    case 91:
    case 93:
        return CMD;
    case 16:
        return SHIFT;
    case 18:
        return ALT;
    case 17:
        return CTRL;
    case 27:
        return ESC;
    default:
        return 0;
    }
}

function codeModifier(code) {
    if(code == "⌃") return CTRL;
    if(code == "⌥") return ALT;
    if(code == "⇧") return SHIFT;
    if(code == "⌘") return CMD;
    if(code == "⎋") return ESC;
    return 0;
}

var handlers = {};

function triggerCallbacks(modifiers, keys, event) {
    if(handlers[modifiers] && handlers[modifiers][keys]) {
        event.preventDefault();
        event.stopPropagation();
        var cbs = handlers[modifiers][keys];
        for(var i in cbs) cbs[i](event);
    }
}

window.onload = function() {
    document.addEventListener('keydown', function(event) {
        var modifier = modifierCode(event);
        if (modifier !== 0) {
            modifiers = modifiers | modifier; // add to the bitmask "stack"
            triggerCallbacks(modifiers, modifiers, event);
        } else if(modifiers != 0) {
            var shortcut = '';
            shortcut += String.fromCharCode(parseInt(event.keyIdentifier.replace(/^U\+0*/, ''), 16)).toUpperCase();
            event.shortcut = shortcut;
            triggerCallbacks(modifiers, shortcut, event);
        }
    });

    document.addEventListener('keyup', function(event) {
        modifiers = modifiers & ~modifierCode(event); // remove from the stack
    });
};

class Keystrokes {
    resolveShortcut(shortcut) {
        var modifiers = 0;
        var alphabet = '';
        shortcut.split('').forEach(c => {
            var bit = codeModifier(c);
            bit == 0 ? alphabet += c.toUpperCase() : modifiers |= bit;
        });
        if(alphabet == '') alphabet = modifiers;
        return { modifiers, alphabet };
    }
    listen(shortcut, handler) {
        var key = Date.now();
        if(!(shortcut instanceof Array)) shortcut = [shortcut];
        shortcut.forEach(shortcut => {
            var { modifiers, alphabet } = this.resolveShortcut(shortcut);
            if(!handlers[modifiers]) handlers[modifiers] = {};
            if(!handlers[modifiers][alphabet]) handlers[modifiers][alphabet] = {};
            handlers[modifiers][alphabet][key] = handler;
        });
        return key;
    }
    unlisten(shortcut, key) {
        if(!(shortcut instanceof Array)) shortcut = [shortcut];
        shortcut.forEach(shortcut => {
            var { modifiers, alphabet } = this.resolveShortcut(shortcut);
            if(handlers[modifiers] && handlers[modifiers][alphabet]) delete handlers[modifiers][alphabet][key];
        });
    }
};





export default (new Keystrokes);
