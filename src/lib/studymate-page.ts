import studymateHtml from "../studymate.html?raw";

const ROUTER_SCRIPT = `
<script>
(function () {
  var NAV = {
    "/": "navCreate",
    "/explain": "navCreateExplain",
    "/summary": "navCreateSummary",
    "/library": "navLibrary",
  };
  var PATH_BY_NAV = {
    navCreate: "/",
    navCreateExplain: "/explain",
    navCreateSummary: "/summary",
    navLibrary: "/library",
  };

  function normalize(p) {
    if (!p) return "/";
    p = p.replace(/\\/+$/, "");
    return p === "" ? "/" : p;
  }

  function applyPath(path, viaPush) {
    var id = NAV[normalize(path)];
    if (!id) return;
    var btn = document.getElementById(id);
    if (btn) btn.click();
    if (viaPush) window.scrollTo({ top: 0 });
  }

  function syncUrl(navId) {
    var path = PATH_BY_NAV[navId];
    if (!path) return;
    if (normalize(location.pathname) !== path) {
      history.pushState({ smNav: navId }, "", path);
    }
  }

  function init() {
    Object.keys(PATH_BY_NAV).forEach(function (navId) {
      var btn = document.getElementById(navId);
      if (btn) btn.addEventListener("click", function () { syncUrl(navId); });
    });
    applyPath(location.pathname, false);
    window.addEventListener("popstate", function () {
      applyPath(location.pathname, true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>
`;

const html = studymateHtml.includes("</body>")
  ? studymateHtml.replace("</body>", ROUTER_SCRIPT + "</body>")
  : studymateHtml + ROUTER_SCRIPT;

export function studymateResponse() {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
