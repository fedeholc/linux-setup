// Monitor de cron — desklet para Cinnamon
//
// Muestra:
//   - crontab del usuario y del sistema (/etc/crontab y /etc/cron.d)
//   - tareas periódicas de run-parts (/etc/cron.{hourly,daily,weekly,monthly})
//   - timers de systemd (los "cronjobs modernos")
//   - trabajos de cron que están ejecutándose en este momento
//
// Licencia: GPL-2.0-or-later

const Desklet = imports.ui.desklet;
const Settings = imports.ui.settings;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;

const UUID = "cron-monitor@fede";
const DESKLET_WIDTH = 470;
const CONTENT_WIDTH = DESKLET_WIDTH - 28;
const MAX_SCROLL_HEIGHT = 500;

Gettext.bindtextdomain(UUID, GLib.get_home_dir() + "/.local/share/locale");

function _(text) {
    return Gettext.dgettext(UUID, text);
}

// ===== BEGIN HELPERS =====
// Helpers sin dependencias de St/Cinnamon: se pueden probar con gjs aislados.

const COMMAND_TIMEOUT = "3";

function toText(bytes) {
    if (!bytes)
        return "";
    if (typeof bytes === "string")
        return bytes;
    try {
        return new TextDecoder("utf-8").decode(bytes);
    } catch (e) {}
    try {
        return imports.byteArray.toString(bytes);
    } catch (e) {}
    return "";
}

function run(argv) {
    try {
        let [, out] = GLib.spawn_sync(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
        return toText(out);
    } catch (e) {
        return "";
    }
}

function readFile(path) {
    try {
        let [ok, bytes] = GLib.file_get_contents(path);
        return ok ? toText(bytes) : "";
    } catch (e) {
        return "";
    }
}

function listDir(path) {
    let names = [];
    try {
        let dir = GLib.Dir.open(path, 0);
        let name;
        while ((name = dir.read_name()) !== null) {
            if (name.charAt(0) !== ".")
                names.push(name);
        }
        dir.close();
    } catch (e) {
        return null;
    }
    names.sort();
    return names;
}

const SPECIAL_SCHEDULES = [
    "@reboot", "@yearly", "@annually", "@monthly", "@weekly",
    "@daily", "@midnight", "@hourly",
];

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun",
                     "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function validCronField(field, names) {
    if (!/^[0-9A-Za-z*?\/,\-]+$/.test(field))
        return false;

    for (let part of field.split(",")) {
        let pieces = part.split("/");
        if (pieces.length > 2)
            return false;

        if (pieces.length === 2 && !/^\d+$/.test(pieces[1]))
            return false;

        let base = pieces[0];
        if (base === "*" || base === "?")
            continue;

        for (let piece of base.split("-")) {
            if (/^\d+$/.test(piece))
                continue;
            if (names && names.indexOf(piece.toLowerCase()) >= 0)
                continue;
            return false;
        }
    }

    return true;
}

function splitCronJob(text) {
    let tokens = text.trim().split(/\s+/);
    if (!tokens.length)
        return null;

    let schedule;
    let index;

    if (tokens[0].charAt(0) === "@") {
        if (SPECIAL_SCHEDULES.indexOf(tokens[0].toLowerCase()) < 0)
            return null;
        schedule = tokens[0];
        index = 1;
    } else {
        if (tokens.length < 6)
            return null;

        // Validamos los 5 campos: evita tomar comentarios en prosa como jobs.
        let fields = tokens.slice(0, 5);
        for (let i = 0; i < fields.length; i++) {
            let names = i === 3 ? MONTH_NAMES : (i === 4 ? DAY_NAMES : null);
            if (!validCronField(fields[i], names))
                return null;
        }

        schedule = fields.join(" ");
        index = 5;
    }

    return { schedule, rest: tokens.slice(index) };
}

function parseCronText(text, source, hasUser) {
    let jobs = [];
    let lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let raw = lines[i].trim();
        if (!raw)
            continue;

        let disabled = false;
        if (raw.charAt(0) === "#") {
            raw = raw.replace(/^#+\s*/, "");
            if (!raw)
                continue;
            disabled = true;
        }

        // MAILTO=..., PATH=..., SHELL=...
        if (/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(raw))
            continue;

        let parsed = splitCronJob(raw);
        if (!parsed)
            continue;

        let rest = parsed.rest;
        let user = null;

        if (hasUser) {
            if (!rest.length)
                continue;
            user = rest.shift();
            if (!/^[A-Za-z0-9_.][A-Za-z0-9_.-]*$/.test(user))
                continue;
        }

        let command = rest.join(" ");
        if (!command)
            continue;

        // Ejemplos de formato en los comentarios de /etc/crontab (Debian/RHEL)
        if (disabled && (user === "user-name" || /^command to be executed\b/.test(command)))
            continue;

        jobs.push({
            schedule: parsed.schedule,
            user,
            command,
            source,
            disabled,
            line: i + 1,
        });
    }

    return jobs;
}

function systemdTimers() {
    let out = run([
        "env", "LC_ALL=C", "timeout", COMMAND_TIMEOUT,
        "systemctl", "list-timers", "--all", "--no-pager", "--output=json",
    ]).trim();

    if (out.charAt(0) === "[") {
        try {
            let data = JSON.parse(out);
            if (Array.isArray(data)) {
                let timers = [];
                for (let timer of data) {
                    let next = Number(timer.next);
                    if (!isFinite(next) || next <= 0)
                        continue;
                    let last = Number(timer.last);
                    timers.push({
                        unit: timer.unit,
                        activates: timer.activates || "",
                        next: next / 1e6,
                        last: isFinite(last) && last > 0 ? last / 1e6 : null,
                    });
                }
                timers.sort((a, b) => a.next - b.next);
                return timers;
            }
        } catch (e) {
            // systemd viejo: caemos al parseo de texto
        }
    }

    let text = run([
        "env", "LC_ALL=C", "timeout", COMMAND_TIMEOUT,
        "systemctl", "list-timers", "--all", "--no-pager",
    ]);

    return parseTimersText(text);
}

function parseTimersText(text) {
    let timers = [];
    let lines = text.split("\n");

    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || /timers? listed/.test(line))
            continue;

        let cols = line.split(/\s{2,}/);
        let unitIndex = cols.findIndex(col => /\.timer$/.test(col));
        if (unitIndex < 1)
            continue;

        let when = "";
        let left = unitIndex >= 4 ? cols[1] : "";
        if (/ago$/.test(left))
            when = "hace " + left.replace(/\s*ago$/, "");
        else if (left && left !== "-")
            when = "en " + left;

        timers.push({
            unit: cols[unitIndex],
            activates: cols[unitIndex + 1] || "",
            when,
        });
    }

    return timers;
}

function readProcesses() {
    let out = run(["ps", "-eo", "pid=,ppid=,etimes=,args="]);
    let procs = [];

    for (let line of out.split("\n")) {
        let match = line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
        if (!match)
            continue;
        procs.push({
            pid: parseInt(match[1], 10),
            ppid: parseInt(match[2], 10),
            elapsed: parseInt(match[3], 10),
            args: match[4],
        });
    }

    return procs;
}

function findCronDaemon(procs) {
    for (let proc of procs) {
        let base = proc.args.split(/\s+/)[0].split("/").pop();
        if ((base === "cron" || base === "crond") && proc.ppid <= 1)
            return proc;
    }

    for (let proc of procs) {
        let base = proc.args.split(/\s+/)[0].split("/").pop();
        if (base === "cron" || base === "crond")
            return proc;
    }

    return null;
}

function runningCronJobs(procs, daemon) {
    if (!daemon)
        return [];

    let children = new Map();
    for (let proc of procs) {
        if (!children.has(proc.ppid))
            children.set(proc.ppid, []);
        children.get(proc.ppid).push(proc);
    }

    let pending = (children.get(daemon.pid) || []).slice();
    let seen = new Set();
    let descendants = [];

    while (pending.length) {
        let proc = pending.pop();
        if (seen.has(proc.pid))
            continue;
        seen.add(proc.pid);
        descendants.push(proc);
        for (let child of children.get(proc.pid) || [])
            pending.push(child);
    }

    // Solo las hojas del árbol son el comando real del job.
    let jobs = descendants.filter(proc => !(children.get(proc.pid) || []).length);
    jobs.sort((a, b) => b.elapsed - a.elapsed);
    return jobs;
}

function cronDirectories() {
    let result = [];
    for (let name of ["hourly", "daily", "weekly", "monthly"]) {
        let files = listDir("/etc/cron." + name);
        if (files && files.length)
            result.push({ name, files });
    }
    return result;
}

function humanDelta(seconds) {
    if (!isFinite(seconds))
        return "—";

    let past = seconds < 0;
    let total = Math.abs(Math.round(seconds));

    if (total < 45)
        return past ? "hace instantes" : "ahora";

    let text;
    if (total < 3600) {
        text = Math.round(total / 60) + " min";
    } else if (total < 86400) {
        let hours = Math.floor(total / 3600);
        let minutes = Math.round((total % 3600) / 60);
        text = hours + " h" + (minutes ? " " + minutes + " min" : "");
    } else {
        let days = Math.floor(total / 86400);
        let hours = Math.round((total % 86400) / 3600);
        text = days + " d" + (hours ? " " + hours + " h" : "");
    }

    return past ? "hace " + text : "en " + text;
}

function formatElapsed(seconds) {
    if (seconds < 60)
        return seconds + "s";
    if (seconds < 3600)
        return Math.floor(seconds / 60) + "m";
    if (seconds < 86400) {
        let minutes = Math.floor((seconds % 3600) / 60);
        return Math.floor(seconds / 3600) + "h" + (minutes ? " " + minutes + "m" : "");
    }
    return Math.floor(seconds / 86400) + "d";
}

function wrapText(text, width) {
    let words = String(text).split(/\s+/).filter(word => word.length);
    let lines = [];
    let current = "";

    for (let word of words) {
        while (word.length > width) {
            if (current) {
                lines.push(current);
                current = "";
            }
            lines.push(word.slice(0, width));
            word = word.slice(width);
        }
        if (!word)
            continue;
        if (!current)
            current = word;
        else if (current.length + 1 + word.length <= width)
            current += " " + word;
        else {
            lines.push(current);
            current = word;
        }
    }

    if (current)
        lines.push(current);

    return lines.join("\n");
}

function addChild(parent, child) {
    if (parent.add_child)
        parent.add_child(child);
    else
        parent.add_actor(child);
}

// ===== END HELPERS =====

class CronMonitorDesklet extends Desklet.Desklet {
    constructor(metadata, desklet_id) {
        super(metadata, desklet_id);

        this._timeoutId = 0;
        this._heightId = 0;
        this._heightRetries = 0;

        this._buildUI();

        this.settings = new Settings.DeskletSettings(this, UUID, desklet_id);
        this.settings.bind("refresh-interval", "refreshInterval", () => this._onSettingsChanged());
        this.settings.bind("max-items", "maxItems", () => this._onSettingsChanged());
        this.settings.bind("font-size", "fontSize", () => this._onSettingsChanged());
        this.settings.bind("show-user", "showUser", () => this._onSettingsChanged());
        this.settings.bind("show-system", "showSystem", () => this._onSettingsChanged());
        this.settings.bind("show-cron-dirs", "showCronDirs", () => this._onSettingsChanged());
        this.settings.bind("show-timers", "showTimers", () => this._onSettingsChanged());
        this.settings.bind("show-running", "showRunning", () => this._onSettingsChanged());
        this.settings.bind("show-disabled", "showDisabled", () => this._onSettingsChanged());

        this._menu.addAction(_("Actualizar ahora"), () => this._refresh());

        this.setHeader(_("Monitor de cron"));
        this._refresh();
    }

    _buildUI() {
        this._root = new St.BoxLayout({
            vertical: true,
            style_class: "cron-root",
        });
        this._root.set_width(DESKLET_WIDTH);

        this._status = new St.BoxLayout({
            vertical: false,
            style_class: "cron-status",
        });

        this._statusDot = new St.Label({ text: "●", style_class: "cron-dot-off" });
        this._statusText = new St.Label({ text: _("Leyendo cron…"), style_class: "cron-status-text" });
        addChild(this._status, this._statusDot);
        addChild(this._status, this._statusText);

        this._scroll = new St.ScrollView({
            style_class: "cron-scroll",
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
        });
        this._list = new St.BoxLayout({ vertical: true, style_class: "cron-list" });
        // Ojo: debe ser add_actor() y no set_child(), para que StScrollView
        // registre el hijo como StScrollable y pueda destruirlo sin asserts.
        this._scroll.add_actor(this._list);

        addChild(this._root, this._status);
        addChild(this._root, this._scroll);

        this.setContent(this._root);
    }

    _onSettingsChanged() {
        this._applyFontSize();
        this._refresh();
    }

    _applyFontSize() {
        let size = Number(this.fontSize) || 11;
        this._root.set_style("font-size: " + size + "px;");
    }

    _wrapWidth() {
        let size = Number(this.fontSize) || 11;
        return Math.max(20, Math.floor(CONTENT_WIDTH / (size * 0.62)));
    }

    _refresh() {
        if (this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }

        try {
            this._render();
        } catch (e) {
            global.logError(UUID + ": " + e);
            if (this._statusText)
                this._statusText.set_text(_("Error al leer cron: ") + e.message);
        }

        let interval = Math.max(5, Number(this.refreshInterval) || 30);
        this._timeoutId = Mainloop.timeout_add_seconds(interval, () => {
            this._timeoutId = 0;
            this._refresh();
            return false;
        });
    }

    _render() {
        this._list.destroy_all_children();

        let procs = readProcesses();
        let daemon = findCronDaemon(procs);
        let running = runningCronJobs(procs, daemon);

        let userJobs = [];
        if (this.showUser !== false)
            userJobs = parseCronText(run(["crontab", "-l"]), "", false);

        let systemJobs = [];
        if (this.showSystem !== false) {
            systemJobs = systemJobs.concat(parseCronText(readFile("/etc/crontab"), "/etc/crontab", true));
            for (let name of listDir("/etc/cron.d") || []) {
                let path = "/etc/cron.d/" + name;
                systemJobs = systemJobs.concat(parseCronText(readFile(path), path, true));
            }
        }

        if (this.showDisabled !== true) {
            userJobs = userJobs.filter(job => !job.disabled);
            systemJobs = systemJobs.filter(job => !job.disabled);
        }

        let timers = this.showTimers !== false ? systemdTimers() : [];
        let cronDirs = this.showCronDirs !== false ? cronDirectories() : [];
        let maxItems = Math.max(1, Number(this.maxItems) || 8);

        this._statusDot.set_style_class_name(daemon ? "cron-dot-on" : "cron-dot-off");

        let summary = [daemon ? _("cron activo") : _("cron inactivo")];
        summary.push((userJobs.length + systemJobs.length) + " " + _("jobs"));
        if (this.showTimers !== false)
            summary.push(timers.length + " " + _("timers"));
        if (this.showRunning !== false)
            summary.push(running.length + " " + _("en ejecución"));
        this._statusText.set_text(summary.join("  ·  "));

        if (this.showUser !== false) {
            this._addSection(_("CRONTAB DEL USUARIO") + "  ·  " + userJobs.length);
            if (userJobs.length)
                this._addJobs(userJobs, maxItems);
            else
                this._addEmpty(_("no hay cronjobs definidos"));
        }

        if (this.showSystem !== false) {
            this._addSection(_("CRONTAB DEL SISTEMA") + "  ·  " + systemJobs.length);
            if (systemJobs.length)
                this._addJobs(systemJobs, maxItems);
            else
                this._addEmpty(_("no hay cronjobs definidos"));
        }

        if (this.showCronDirs !== false && cronDirs.length) {
            let total = cronDirs.reduce((sum, dir) => sum + dir.files.length, 0);
            let labels = {
                hourly: _("cada hora"),
                daily: _("diario"),
                weekly: _("semanal"),
                monthly: _("mensual"),
            };
            this._addSection(_("TAREAS PERIÓDICAS (run-parts)") + "  ·  " + total);
            for (let dir of cronDirs)
                this._addRow(labels[dir.name] || dir.name,
                              wrapText(dir.files.join(", "), this._wrapWidth()),
                              "cron-cmd");
        }

        if (this.showTimers !== false) {
            this._addSection(_("TIMERS DE SYSTEMD") + "  ·  " + timers.length);
            if (timers.length)
                this._addTimers(timers, maxItems);
            else
                this._addEmpty(_("ninguno programado"));
        }

        if (this.showRunning !== false) {
            this._addSection(_("EN EJECUCIÓN AHORA") + "  ·  " + running.length);
            if (running.length)
                this._addRunning(running, maxItems);
            else
                this._addEmpty(daemon ? _("nada corriendo") : _("cron no está activo"));
        }

        if (GLib.file_test("/var/spool/cron/crontabs", GLib.FileTest.IS_DIR) &&
            listDir("/var/spool/cron/crontabs") === null)
            this._addHint(_("Los crontabs de otros usuarios requieren root."));

        this._scheduleHeightUpdate();
    }

    _scheduleHeightUpdate() {
        if (this._heightId)
            return;

        this._heightRetries = 0;
        this._heightId = Mainloop.timeout_add(50, () => this._updateScrollHeight());
    }

    _updateScrollHeight() {
        let staged = false;
        try {
            staged = !!this._root.get_stage();
        } catch (e) {}

        if (!staged) {
            // La primera vez puede tardar un frame en entrar al stage.
            if (++this._heightRetries > 40) {
                this._heightId = 0;
                return false;
            }
            return true;
        }

        let [, naturalHeight] = this._list.get_preferred_height(CONTENT_WIDTH);
        this._scroll.set_height(Math.min(MAX_SCROLL_HEIGHT, Math.max(24, Math.ceil(naturalHeight) + 2)));
        this._heightId = 0;
        return false;
    }

    _addSection(title) {
        let label = new St.Label({ text: title, style_class: "cron-section" });
        label.set_opacity(150);
        addChild(this._list, label);
    }

    _addEmpty(text) {
        let label = new St.Label({ text: "· " + text, style_class: "cron-empty" });
        label.set_opacity(120);
        addChild(this._list, label);
    }

    _addHint(text) {
        let label = new St.Label({ text: text, style_class: "cron-hint" });
        label.set_opacity(110);
        addChild(this._list, label);
    }

    _addRow(metaText, bodyText, styleClass) {
        let row = new St.BoxLayout({ vertical: true, style_class: "cron-row" });
        let meta = new St.Label({ text: metaText, style_class: "cron-meta" });
        meta.set_opacity(165);
        addChild(row, meta);

        if (bodyText) {
            let body = new St.Label({ text: bodyText, style_class: styleClass || "cron-cmd" });
            addChild(row, body);
        }

        addChild(this._list, row);
    }

    _addMore(hidden) {
        this._addEmpty("+" + hidden + " " + _("más"));
    }

    _addJobs(jobs, maxItems) {
        let width = this._wrapWidth();
        let shown = jobs.slice(0, maxItems);

        for (let job of shown) {
            let meta = job.schedule;
            if (job.user)
                meta += "  ·  " + job.user;
            if (job.source && job.source.indexOf("/etc/") === 0)
                meta += "  ·  " + job.source;
            if (job.disabled)
                meta += "  ·  " + _("desactivado");

            let styleClass = job.disabled ? "cron-cmd cron-off" : "cron-cmd";
            this._addRow(meta, wrapText(job.command, width), styleClass);
        }

        if (jobs.length > shown.length)
            this._addMore(jobs.length - shown.length);
    }

    _addTimers(timers, maxItems) {
        let width = this._wrapWidth() - 8;
        let now = Date.now() / 1000;
        let shown = timers.slice(0, maxItems);

        for (let timer of shown) {
            let when = timer.when !== undefined ? timer.when : humanDelta(timer.next - now);
            let body = timer.unit + (timer.activates ? "  →  " + timer.activates : "");
            this._addRow(when, wrapText(body, width), "cron-cmd");
        }

        if (timers.length > shown.length)
            this._addMore(timers.length - shown.length);
    }

    _addRunning(jobs, maxItems) {
        let width = this._wrapWidth() - 12;
        let shown = jobs.slice(0, maxItems);

        for (let job of shown) {
            let meta = formatElapsed(job.elapsed) + "  ·  PID " + job.pid;
            this._addRow(meta, wrapText(job.args, width), "cron-cmd");
        }

        if (jobs.length > shown.length)
            this._addMore(jobs.length - shown.length);
    }

    on_desklet_removed() {
        if (this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }
        if (this._heightId) {
            GLib.source_remove(this._heightId);
            this._heightId = 0;
        }
        if (this.settings)
            this.settings.finalize();
    }
}

function main(metadata, desklet_id) {
    return new CronMonitorDesklet(metadata, desklet_id);
}
