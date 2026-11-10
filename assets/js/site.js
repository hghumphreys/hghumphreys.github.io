/* Fills index.html from data/content.json and runs the EN/FR toggle.
   Bilingual fields are { "en": "...", "fr": "..." }; an empty "fr" falls back to the English text,
   so Hannah can leave French blank and the page still works. Empty lists hide their section. */
(function () {
  "use strict";

  var body = document.body;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- helpers ---------- */

  // Paths may come from the CMS as "/assets/x.pdf"; make them relative so the site also works
  // when served from a sub-path or opened locally.
  function asset(path) { return (path || "").replace(/^\/+/, ""); }

  // Returns one element for each language. When French is empty or identical, a single
  // element without a lang attribute is returned so it shows in both modes.
  // The CMS editor saves an "empty" rich-text box as "<p></p>" or "<p><br></p>", so a field
  // counts as blank when it has no visible text once tags and &nbsp; are stripped.
  function blank(s) {
    return !(s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;|\u00a0/g, " ").trim();
  }
  function clean(s) { return blank(s) ? "" : (s || "").trim(); }

  function bi(field, tag, html, cls) {
    field = field || {};
    var en = clean(field.en);
    var fr = clean(field.fr) || en;
    var make = function (text, lang) {
      var el = document.createElement(tag || "span");
      if (lang) el.setAttribute("lang", lang);
      if (cls) el.className = cls;
      if (html) el.innerHTML = text; else el.textContent = text;
      return el;
    };
    if (en === fr) return [make(en)];
    return [make(en, "en"), make(fr, "fr")];
  }

  function append(parent, nodes) { nodes.forEach(function (n) { parent.appendChild(n); }); }

  function hideSection(id) {
    $(id).classList.add("hidden");
    var link = document.querySelector('[data-nav="' + id + '"]');
    if (link) link.classList.add("hidden");
  }

  function hasText(field) { return field && !(blank(field.en) && blank(field.fr)); }

  /* ---------- render ---------- */

  function render(c) {
    // Name: header, footer, and the hero (last word in rose italics)
    document.querySelectorAll('[data-fill="name"]').forEach(function (el) { el.textContent = c.name; });
    var parts = (c.name || "").trim().split(/\s+/);
    var last = parts.pop();
    var h1 = $("hero-name");
    h1.textContent = parts.length ? parts.join(" ") + " " : "";
    var em = document.createElement("em"); em.textContent = last; h1.appendChild(em);
    $("year").textContent = new Date().getFullYear();

    // Role + affiliation
    var role = $("role"); role.textContent = "";
    ["en", "fr"].forEach(function (lang) {
      var r = (c.role && (c.role[lang] || c.role.en)) || "";
      var a = (c.affiliation && (c.affiliation[lang] || c.affiliation.en)) || "";
      var span = document.createElement("span");
      span.setAttribute("lang", lang);
      span.appendChild(document.createTextNode(r));
      span.appendChild(document.createElement("br"));
      span.appendChild(document.createTextNode(a));
      role.appendChild(span);
    });

    // Photo
    if (c.photo) $("photo").src = asset(c.photo);
    $("photo").alt = c.name;

    // Interest tags cycle through the four tints
    var tints = ["--rose-tint", "--sage-tint", "--slate-tint", "--walnut-tint"];
    var tags = $("interests");
    (c.interests || []).forEach(function (it, i) {
      var tag = document.createElement("span");
      tag.style.background = "var(" + tints[i % 4] + ")";
      append(tag, bi(it));
      tags.appendChild(tag);
    });

    // About
    append($("about-text"), bi(c.about, "div", true));

    // Research projects
    var research = (c.research || []).filter(function (r) { return hasText(r.title); });
    if (!research.length) hideSection("research");
    research.forEach(function (r) {
      var box = document.createElement("div"); box.className = "project";
      append(box, bi(r.title, "h3"));
      if (hasText(r.details)) append(box, bi(r.details, "div", false, "meta"));
      if (hasText(r.description)) append(box, bi(r.description, "div", true, "rich"));
      $("research-list").appendChild(box);
    });

    // Publications and presentations (citations are the same in both languages)
    function refs(list, ulId, blockId) {
      list = (list || []).filter(function (x) { return x.citation; });
      if (!list.length) $(blockId).classList.add("hidden");
      list.forEach(function (x) {
        var li = document.createElement("li"); li.innerHTML = x.citation; $(ulId).appendChild(li);
      });
      return list.length;
    }
    var n = refs(c.publications, "pubs", "pubs-block") + refs(c.presentations, "talks", "talks-block");
    if (!n) hideSection("publications");

    // Teaching
    var teaching = (c.teaching || []).filter(function (t) { return hasText(t.course); });
    if (!teaching.length) hideSection("teaching");
    teaching.forEach(function (t) {
      var card = document.createElement("div");
      append(card, bi(t.course, "b"));
      ["en", "fr"].forEach(function (lang) {
        var bits = [t.role, t.term].map(function (f) { return f ? (f[lang] || f.en || "") : ""; })
                                   .filter(Boolean);
        var meta = document.createElement("span");
        meta.className = "meta"; meta.setAttribute("lang", lang); meta.textContent = bits.join(" · ");
        card.appendChild(meta);
      });
      $("teaching-list").appendChild(card);
    });

    // Contact links (blank ones are left out)
    var links = $("links"); links.textContent = "";
    var items = [];
    if (c.email) items.push(["mailto:" + c.email, c.email]);
    if (c.google_scholar) items.push([c.google_scholar, "Google Scholar"]);
    if (c.orcid) items.push([c.orcid, "ORCID"]);
    if (c.academia) items.push([c.academia, "Academia"]);
    items.forEach(function (it, i) {
      if (i) links.appendChild(document.createTextNode(" · "));
      var a = document.createElement("a"); a.href = it[0]; a.textContent = it[1];
      if (it[0].indexOf("mailto:") !== 0) { a.target = "_blank"; a.rel = "noopener"; }
      links.appendChild(a);
    });

    // CV
    var cv = $("cv-link");
    if (c.cv) { cv.href = asset(c.cv); cv.target = "_blank"; cv.rel = "noopener"; }
    else cv.classList.add("hidden");
  }

  /* ---------- language toggle (same pattern as andrewlkline.github.io) ---------- */

  var STORAGE_KEY = "site-lang";
  var toggle = $("lang-toggle");

  function applyLang(lang) {
    body.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
    toggle.setAttribute("data-current", lang);
    toggle.setAttribute("aria-label", lang === "en" ? "Switch to French" : "Passer à l’anglais");
  }

  // ?lang=fr in the URL wins (shareable French link); otherwise the visitor's last choice
  var saved = "en";
  try { saved = localStorage.getItem(STORAGE_KEY) || "en"; } catch (e) {}
  var param = new URLSearchParams(location.search).get("lang");
  if (param === "en" || param === "fr") saved = param;
  applyLang(saved === "fr" ? "fr" : "en");

  toggle.addEventListener("click", function () {
    var next = body.getAttribute("data-lang") === "en" ? "fr" : "en";
    applyLang(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });

  /* ---------- load content ---------- */

  // The static text already in index.html stays visible if loading fails.
  // no-cache: after Hannah saves in the CMS, visitors get the new file, not a stale copy.
  fetch("data/content.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (err) { console.error("Could not load data/content.json:", err); });
})();
