(function(global){
  'use strict';
  const offsets = {YT:-9031,FA:-4031,SA:-3441,TA:0,FoA:3021};
  function dateFromYear(y){
    const age = y > 3021 ? 'FoA' : y >= 1 ? 'TA' : y > -3441 ? 'SA' : y > -4031 ? 'FA' : 'YT';
    return {age,year:y-offsets[age]};
  }
  function absoluteYear(age, year, end = 3141){
    if (!Object.hasOwn(offsets,age) || !Number.isInteger(year) || year < 1) return null;
    const y = year + offsets[age];
    if (y < -9000 || y > end || dateFromYear(y).age !== age) return null;
    return y;
  }
  function parse(search, data, end = 3141){
    const p = new URLSearchParams(search), result = {place:null,journey:null,event:null,chapter:null,year:null,error:null};
    const fail = message => ({place:null,journey:null,event:null,chapter:null,year:null,error:message});
    const keys = ['place','journey','event','chapter'].filter(key=>p.has(key));
    if (keys.length > 1 || ['place','journey','event','chapter','age','year'].some(k=>p.getAll(k).length>1)) return fail('Choose one place, journey, event or chapter in the link.');
    for (const key of keys) {
      const collection = key === 'place' ? data.places : key === 'journey' ? data.journeys : key === 'chapter' ? data.chapters : data.timeline;
      const found = collection.find(item=>item.id===p.get(key));
      if (!found) return fail('That '+key+' was not found. Explore the atlas or try the search.');
      result[key] = found.id;
      if (key === 'event') result.year = found.absoluteYear;
    }
    if (result.chapter && (p.has('age') || p.has('year'))) return fail('A chapter spans time and cannot be combined with a timeline year.');
    if (!result.event && (p.has('age') || p.has('year'))) {
      if (!p.has('age') || !/^\d+$/.test(p.get('year')||'')) return fail('Use both an age and a whole year in the link.');
      result.year = absoluteYear(p.get('age'),Number(p.get('year')),end);
      if (result.year == null) return fail('That year is outside the supported age or timeline.');
    }
    return result;
  }
  function search(state){
    const p = new URLSearchParams();
    if (state.event) p.set('event',state.event);
    else {
      if (state.place) p.set('place',state.place);
      else if (state.journey) p.set('journey',state.journey);
      else if (state.chapter) p.set('chapter',state.chapter);
      if (state.year != null) { const d = dateFromYear(state.year); p.set('age',d.age); p.set('year',d.year); }
    }
    return p.size ? '?'+p : '';
  }
  global.ATLAS_URL = {parse,search,absoluteYear,dateFromYear};
})(typeof window === 'undefined' ? globalThis : window);
