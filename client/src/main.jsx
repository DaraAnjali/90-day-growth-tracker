import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,useNavigate,Routes,Route,Navigate,Link} from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const API=axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "https://nine0-day-growth-tracker-api.onrender.com/api")
});

API.interceptors.request.use(c=>{
  const t=localStorage.getItem('token');
  if(t)c.headers.Authorization=`Bearer ${t}`;
  return c;
});

const dates=(()=>{
  let a=[],d=new Date(2026,9,1),end=new Date(2026,11,31);
  while(d<=end){
    a.push(new Date(d));
    d.setDate(d.getDate()+1);
  }
  return a;
})();

const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const label=d=>d.toLocaleDateString('en-US',{
  month:'short',
  day:'numeric'
});

function ThemeToggle(){
  const [dark,setDark]=useState(
    ()=>localStorage.getItem('theme')==='dark'
  );

  useEffect(()=>{
    document.documentElement.setAttribute(
      'data-theme',
      dark?'dark':'light'
    );

    localStorage.setItem(
      'theme',
      dark?'dark':'light'
    );
  },[dark]);

  return(
    <button
      className="theme-toggle"
      onClick={()=>setDark(!dark)}
      title={dark?'Switch to light mode':'Switch to dark mode'}
      type="button"
    >
      {dark?'☀️':'🌙'}
    </button>
  );
}

function Auth({mode}){
  const nav=useNavigate();

  const [form,setForm]=useState({
    name:'',
    email:'',
    password:''
  });

  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    setError('');
    setLoading(true);

    try{
      const r=await API.post(`/auth/${mode}`,form);

      localStorage.setItem('token',r.data.token);
      localStorage.setItem('user',JSON.stringify(r.data.user));

      nav('/');
    }catch(e){
      setError(
        e.response?.data?.message||
        'Something went wrong'
      );
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="auth">

      <div className="auth-card">

        <div className="auth-theme">
          <ThemeToggle/>
        </div>

        <div className="brand">
          90<span>DAYS</span>
        </div>

        <h1>
          {mode==='login'
            ?'Welcome back'
            :'Create your account'}
        </h1>

        <p>
          {mode==='login'
            ?'Continue your growth journey.'
            :'Start your 90-day growth journey.'}
        </p>

        <form onSubmit={submit}>

          {mode==='register'&&(
            <input
              placeholder="Name"
              value={form.name}
              onChange={e=>
                setForm({
                  ...form,
                  name:e.target.value
                })
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e=>
              setForm({
                ...form,
                email:e.target.value
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e=>
              setForm({
                ...form,
                password:e.target.value
              })
            }
            required
            minLength="6"
          />

          {error&&(
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="primary"
            disabled={loading}
          >
            {loading
              ?'Please wait...'
              :mode==='login'
                ?'Login'
                :'Create account'}
          </button>

        </form>

        <p className="switch">

          {mode==='login'
            ?<>
              New here?{' '}
              <Link to="/register">
                Create an account
              </Link>
            </>
            :<>
              Already have an account?{' '}
              <Link to="/login">
                Login
              </Link>
            </>}

        </p>

      </div>

    </div>
  );
}

function Dashboard({tasks,setTasks,toggle,refresh}){
  const nav=useNavigate();

  const user=JSON.parse(
    localStorage.getItem('user')||'{}'
  );

  const [newTask,setNewTask]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{setLoading(false)},[]);

  const legacyTasks=tasks.filter(t=>!t.isCustom);

  const completed=useMemo(
    ()=>legacyTasks.reduce(
      (n,t)=>
        n+
        Object.values(
          t.completed||{}
        ).filter(Boolean).length,
      0
    ),
    [tasks]
  );

  const total=legacyTasks.length*dates.length;

  const pct=total
    ?Math.round(completed/total*100)
    :0;

  const add=async e=>{
    e.preventDefault();

    if(!newTask.trim())return;

    const r=await API.post(
      '/tasks',
      {name:newTask}
    );

    setTasks(prev=>[...prev,r.data]);

    setNewTask('');
  };

  const remove=async id=>{
    if(!confirm('Remove this task?'))return;

    await API.delete(
      `/tasks/${id}`
    );

    setTasks(prev=>prev.filter(t=>t._id!==id));
  };

  const logout=()=>{
    localStorage.clear();
    nav('/login');
  };

  return(
    <div className="page">

      <header>

        <div>

          <div className="brand small">
            90<span>DAYS</span>
          </div>

          <h1>
            {user.name}'s growth tracker
          </h1>

          <p>
            October 1 — December 31, 2026
          </p>

        </div>



      </header>

      <section className="stats">

        <div>
          <b>{legacyTasks.length}</b>
          <span>Tasks</span>
        </div>

        <div>
          <b>{completed}</b>
          <span>Completed</span>
        </div>

        <div>
          <b>{pct}%</b>
          <span>Progress</span>
        </div>

        <div className="progress">
          <div
            style={{
              width:`${pct}%`
            }}
          />
        </div>

      </section>

      <form
        className="add"
        onSubmit={add}
      >

        <input
          value={newTask}
          onChange={e=>
            setNewTask(e.target.value)
          }
          placeholder="Add a task..."
        />

        <button className="primary">
          + Add task
        </button>

      </form>

      {loading
        ?(
          <div className="empty">
            Loading...
          </div>
        )
        :legacyTasks.length===0
          ?(
            <div className="empty">
              Add your first task to begin your
              90-day journey.
            </div>
          )
          :(
            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th className="sticky task-head">
                      TASK
                    </th>

                    {dates.map(d=>(
                      <th key={key(d)}>
                        {label(d)}
                      </th>
                    ))}

                  </tr>

                </thead>

                <tbody>

                  {legacyTasks.map(t=>(

                    <tr key={t._id}>

                      <td className="sticky task">

                        <span>
                          {t.name}
                        </span>

                        <button
                          className="remove"
                          onClick={()=>
                            remove(t._id)
                          }
                          title="Remove task"
                          type="button"
                        >
                          ×
                        </button>

                      </td>

                      {dates.map(d=>(

                        <td key={key(d)}>

                          <input
                            type="checkbox"
                            checked={
                              !!t.completed?.[
                                key(d)
                              ]
                            }
                            onChange={()=>
                              toggle(t,d)
                            }
                          />

                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

      <div className="hint">

        {saving
          ?'Saving…'
          :'Your checkmarks are saved to your account automatically.'}

      </div>

    </div>
  );
}

function datesBetween(start,end){
 const result=[];let d=new Date(start+'T00:00:00Z'),last=new Date(end+'T00:00:00Z');
 for(;d<=last;d.setUTCDate(d.getUTCDate()+1))result.push(new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
 return result;
}
function TrackerTable({tracker,tasks,toggle,onAdd,onRemove}){
 const [name,setName]=useState('');const [busy,setBusy]=useState(false);
 const days=useMemo(()=>datesBetween(tracker.startDate,tracker.endDate),[tracker.startDate,tracker.endDate]);
 const members=tasks.filter(t=>tracker.taskIds.some(id=>String(id)===t._id));
 const completed=members.reduce((n,t)=>n+days.filter(d=>t.completed?.[key(d)]).length,0);
 const submit=async e=>{e.preventDefault();if(!name.trim())return;setBusy(true);try{await onAdd(tracker._id,name);setName('')}finally{setBusy(false)}};
 return <div className="page">
  <header><div><div className="brand small">GROWTH TRACKER</div><h1>{tracker.name}</h1><p>{tracker.startDate} — {tracker.endDate}</p></div></header>
  <section className="stats"><div><b>{members.length}</b><span>Tasks</span></div><div><b>{completed}</b><span>Completed</span></div><div><b>{members.length?Math.round(completed/(members.length*days.length)*100):0}%</b><span>Progress</span></div><div className="progress"><div style={{width:`${members.length?completed/(members.length*days.length)*100:0}%`}}/></div></section>
  <form className="add" onSubmit={submit}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Add an existing or new task..." required/><button className="primary" disabled={busy}>+ Add task</button></form>
  {!members.length?<div className="empty">Add tasks to this tracker. Matching task names share checkmarks across trackers.</div>:<div className="table-wrap"><table><thead><tr><th className="sticky task-head">TASK</th>{days.map(d=><th key={key(d)}>{label(d)}</th>)}</tr></thead><tbody>{members.map(t=><tr key={t._id}><td className="sticky task"><span>{t.name}</span><button className="remove" type="button" title="Remove from this tracker only" onClick={()=>onRemove(tracker._id,t._id)}>×</button></td>{days.map(d=><td key={key(d)}><input type="checkbox" checked={!!t.completed?.[key(d)]} onChange={()=>toggle(t,d)}/></td>)}</tr>)}</tbody></table></div>}
  <div className="hint">Tasks with matching names reuse the same saved checkmarks on the same date.</div>
 </div>;
}
function CalendarPage({notes,setNotes}){
  const today=new Date();
  const [month,setMonth]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [selected,setSelected]=useState(key(today));
  const [opened,setOpened]=useState(false);
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const entries=notes[selected]||[];
  const offset=month.getDay();
  const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const choose=date=>{setSelected(date);setOpened(true);setEditing(null);setDraft('');setError('')};
  const closePopup=()=>{if(saving)return;setOpened(false);setEditing(null);setDraft('');setError('')};
  const startNew=()=>{setEditing('new');setDraft('');setError('')};
  const startEdit=entry=>{setEditing(entry._id);setDraft(entry.text);setError('')};
  const save=async()=>{
    if(!draft.trim()){setError('Write a note before saving.');return}
    setSaving(true);setError('');
    try{
      const path='/notes/'+selected;
      const response=editing==='new' ? await API.post(path,{text:draft}) : await API.patch(path+'/'+editing,{text:draft});
      setNotes(prev=>({...prev,[selected]:response.data.entries}));
      setEditing(null);setDraft('');
    }catch(e){setError(e.response?.data?.message||'Could not save note')}
    finally{setSaving(false)}
  };
  const remove=async entry=>{
    if(!window.confirm('Delete this note?'))return;
    try{
      const response=await API.delete('/notes/'+selected+'/'+entry._id);
      setNotes(prev=>({...prev,[selected]:response.data.entries}));
      setEditing(null);
    }catch(e){setError(e.response?.data?.message||'Could not delete note')}
  };
  return <div className="page calendar-page">
    <header><div><div className="brand small">GROWTH TRACKER</div><h1>Calendar</h1><p>Choose a date to view or write notes.</p></div></header>
    <div className="calendar-content">
      <div className="calendar-panel">
        <div className="calendar-toolbar">
          <button className="logout" type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>← Previous</button>
          <h2>{month.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h2>
          <button className="logout" type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>Next →</button>
        </div>
        <div className="calendar-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><strong key={d}>{d}</strong>)}
          {Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}
          {Array.from({length:count},(_,i)=>{
            const date=key(new Date(month.getFullYear(),month.getMonth(),i+1));
            return <button type="button" key={date} className={'calendar-day '+(selected===date?'selected':'')} onClick={()=>choose(date)}>
              <span>{i+1}</span>{!!notes[date]?.length&&<span className="note-dot" title="Has notes">•</span>}
            </button>
          })}
        </div>
      </div>
      {opened&&<div className="note-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)closePopup()}}>
        <div className="note-panel note-modal" role="dialog" aria-modal="true" aria-label={`Notes for ${selected}`}>
        <div className="note-heading"><h2>Notes for {selected}</h2><button className="logout" type="button" onClick={closePopup} aria-label="Close notes popup">✕</button></div>
        {entries.length===0?<p className="note-empty">No notes yet for this date.</p>:<div className="note-entry-list">{entries.map(entry=><div className="note-entry" key={entry._id}>
          <p>{entry.text}</p>
          <div className="note-actions"><button className="logout" type="button" onClick={()=>startEdit(entry)}>Edit note</button><button className="logout" type="button" onClick={()=>remove(entry)}>Delete</button></div>
        </div>)}</div>}
        {editing===null?<button className="primary" type="button" onClick={startNew}>+ Add New Note</button>:<div className="note-editor">
          <h3>{editing==='new'?'Add new note':'Edit note'}</h3>
          <textarea value={draft} maxLength={20000} onChange={e=>setDraft(e.target.value)} placeholder="Write your note for this date..." rows={6}/>
          <div className="note-actions"><button className="primary" type="button" onClick={save} disabled={saving}>{saving?'Saving...':'Save note'}</button><button className="logout" type="button" onClick={()=>{setEditing(null);setDraft('');setError('')}}>Cancel</button></div>
        </div>}
        {error&&<p className="error">{error}</p>}
        </div>
      </div>}
    </div>
  </div>;
}

function Workspace(){
 const nav=useNavigate();const [tasks,setTasks]=useState([]),[trackers,setTrackers]=useState([]),[notes,setNotes]=useState({});
 const [active,setActive]=useState('90'),[menu,setMenu]=useState(false),[newName,setNewName]=useState(''),[start,setStart]=useState(key(new Date())),[end,setEnd]=useState(key(new Date(Date.now()+29*86400000))),[showCreate,setShowCreate]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{Promise.all([API.get('/tasks'),API.get('/trackers'),API.get('/notes')]).then(([a,b,c])=>{setTasks(a.data);setTrackers(b.data);setNotes(Object.fromEntries(c.data.map(n=>[n.date,n.entries])));setReady(true)}).catch(e=>{if(e.response?.status===401){localStorage.removeItem('token');nav('/login')}else setError('Could not load data. Ensure the updated backend is deployed.')})},[]);
 const toggle=async(task,date)=>{const k=key(date),value=!task.completed?.[k];setTasks(prev=>prev.map(t=>t._id===task._id?{...t,completed:{...t.completed,[k]:value}}:t));try{await API.patch('/tasks/'+task._id,{dateKey:k,value})}catch(e){setTasks(prev=>prev.map(t=>t._id===task._id?{...t,completed:{...t.completed,[k]:!value}}:t));setError('Unable to save checkbox. Please retry.')}};
 const create=async e=>{e.preventDefault();setError('');try{const r=await API.post('/trackers',{name:newName,startDate:start,endDate:end});setTrackers(prev=>[...prev,r.data]);setActive(r.data._id);setShowCreate(false);setNewName('')}catch(e){setError(e.response?.data?.message||'Could not create tracker')}};
 const add=async(id,name)=>{try{const r=await API.post(`/trackers/${id}/tasks`,{name});setTrackers(prev=>prev.map(t=>t._id===id?r.data.tracker:t));setTasks(prev=>prev.some(t=>t._id===r.data.task._id)?prev:[...prev,r.data.task])}catch(e){setError(e.response?.data?.message||'Could not add task')}};
 const remove=async(id,taskId)=>{try{const r=await API.delete(`/trackers/${id}/tasks/${taskId}`);setTrackers(prev=>prev.map(t=>t._id===id?r.data:t))}catch(e){setError('Could not remove task')}};
 const deleteTracker=async t=>{if(!confirm(`Delete tracker "${t.name}"? Shared tasks and checkmarks will be kept.`))return;try{await API.delete('/trackers/'+t._id);setTrackers(prev=>prev.filter(x=>x._id!==t._id));setActive('90')}catch(e){setError('Could not delete tracker')}};
 const logout=()=>{localStorage.removeItem('token');localStorage.removeItem('user');nav('/login')};
 return <div className="workspace"><nav className="workspace-nav"><div className="workspace-nav-top"><strong>✦ Growth Tracker</strong><button className="logout mobile-menu" onClick={()=>setMenu(!menu)}>☰ Menu</button></div><div className={'workspace-links '+(menu?'open':'')}><button className={active==='90'?'nav-active':''} onClick={()=>{setActive('90');setMenu(false)}}>◈ 90-Day Tracker</button><button className={active==='calendar'?'nav-active':''} onClick={()=>{setActive('calendar');setMenu(false)}}>▣ Calendar</button>{trackers.map(t=><div className="nav-custom" key={t._id}><button className={active===t._id?'nav-active':''} onClick={()=>{setActive(t._id);setMenu(false)}}>◇ {t.name}</button><button className="nav-delete" title="Delete tracker" onClick={()=>deleteTracker(t)}>×</button></div>)}<button onClick={()=>{setShowCreate(!showCreate);setMenu(false)}}>✚ New Tracker</button></div><div className="workspace-account"><ThemeToggle/><button className="logout" onClick={logout}>Logout</button></div></nav>
 {error&&<div className="workspace-error error">{error}<button onClick={()=>setError('')}>×</button></div>}
 {showCreate&&<form className="create-tracker" onSubmit={create}><h2>Create a tracker</h2><input placeholder="Tracker name" maxLength={80} value={newName} onChange={e=>setNewName(e.target.value)} required/><label>Start date <input type="date" value={start} onChange={e=>setStart(e.target.value)} required/></label><label>End date <input type="date" value={end} min={start} onChange={e=>setEnd(e.target.value)} required/></label><button className="primary">Create tracker</button><button className="logout" type="button" onClick={()=>setShowCreate(false)}>Cancel</button></form>}
 {!ready?<div className="page">{error?'Unable to load tracker.':'Loading...'}</div>:active==='90'?<Dashboard tasks={tasks} setTasks={setTasks} toggle={toggle}/>:active==='calendar'?<CalendarPage notes={notes} setNotes={setNotes}/>:<TrackerTable key={active} tracker={trackers.find(t=>t._id===active)} tasks={tasks} toggle={toggle} onAdd={add} onRemove={remove}/>}
 </div>;
}
function App(){return <Routes><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/" element={localStorage.getItem('token')?<Workspace/>:<Navigate to="/login" replace/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
