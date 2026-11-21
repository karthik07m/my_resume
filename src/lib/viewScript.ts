// Kept apart from view.ts so the server layout can inline it without importing a client hook.
export const VIEW_KEY = 'resume-view'

// Runs in <head> before first paint: marks <html> for an anime visitor, so the plain page never flashes.
export const VIEW_SCRIPT = `try{var v=new URLSearchParams(location.search).get('view')||sessionStorage.getItem('${VIEW_KEY}');if(v==='anime')document.documentElement.dataset.view='anime'}catch(e){}`
