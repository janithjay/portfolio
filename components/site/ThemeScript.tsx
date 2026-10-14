import { STORAGE } from "@/lib/theme";

/**
 * Runs before first paint: applies reading mode (URL first, then the saved
 * choice), colour scheme and any custom design tokens. No flash, no layout shift.
 */
const script = `(function(){var d=document.documentElement;d.classList.add('js');try{var q=new URLSearchParams(location.search).get('mode');var m=(q==='skim'||q==='deep')?q:localStorage.getItem('${STORAGE.mode}');if(m==='skim'||m==='deep')d.dataset.mode=m;var s=localStorage.getItem('${STORAGE.scheme}');if(s==='light'||s==='dark')d.dataset.theme=s;var c=localStorage.getItem('${STORAGE.tokensCss}');if(c){var e=document.createElement('style');e.id='jj-tokens';e.textContent=c;document.head.appendChild(e)}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
