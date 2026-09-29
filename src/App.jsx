import React, { useEffect, useState } from "react";
import {
Shield,
Flame,
CheckCircle2,
Circle,
Dumbbell,
LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";

function AuthScreen() {
const [mode, setMode] = useState("join");
const [displayName, setDisplayName] = useState("");
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const joinChallenge = async () => {
if (!displayName || !username || !email || !password) {
setMessage("Please complete every field.");
return;
}

setLoading(true);
setMessage("");

const cleanUsername = username.trim().toLowerCase();

const { data, error } = await supabase.auth.signUp({
email: email.trim(),
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

if (data.user) {
const { error: profileError } = await supabase
.from("profiles")
.insert({
id: data.user.id,
username: cleanUsername,
display_name: displayName.trim(),
is_active: true,
});

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}
}

if (!data.session) {
setMessage(
"Account created. Check your email to confirm your account, then sign in."
);
setMode("login");
}

setLoading(false);
};

const signIn = async () => {
if (!email || !password) {
setMessage("Enter your email and password.");
return;
}

setLoading(true);
setMessage("");

const { error } = await supabase.auth.signInWithPassword({
email: email.trim(),
password,
});

if (error) {
setMessage(error.message);
}

setLoading(false);
};

return (
<div className="auth-screen">
<div className="auth-overlay">
<div className="auth-brand-mark">
<Shield size={28} />
</div>

<p className="auth-small">THE</p>
<h1>CODE OF HONOR</h1>
<p className="auth-tagline">DISCIPLINE BUILDS FREEDOM</p>

<div className="auth-card">
<div className="auth-tabs">
<button
className={mode === "join" ? "active" : ""}
onClick={() => {
setMode("join");
setMessage("");
}}
>
JOIN
</button>

<button
className={mode === "login" ? "active" : ""}
onClick={() => {
setMode("login");
setMessage("");
}}
>
SIGN IN
</button>
</div>

{mode === "join" && (
<>
<input
placeholder="YOUR NAME"
value={displayName}
onChange={(e) => setDisplayName(e.target.value)}
/>

<input
placeholder="USERNAME"
value={username}
onChange={(e) => setUsername(e.target.value)}
autoCapitalize="none"
/>
</>
)}

<input
type="email"
placeholder="EMAIL"
value={email}
onChange={(e) => setEmail(e.target.value)}
autoCapitalize="none"
/>

<input
type="password"
placeholder="PASSWORD"
value={password}
onChange={(e) => setPassword(e.target.value)}
/>

{message && <div className="auth-message">{message}</div>}

<button
className="primary-button"
disabled={loading}
onClick={mode === "join" ? joinChallenge : signIn}
>
{loading
? "PLEASE WAIT..."
: mode === "join"
? "JOIN THE CHALLENGE"
: "ENTER CODE OF HONOR"}
</button>
</div>

<p className="auth-footer">
OCTOBER 1 — OCTOBER 31
<br />
31 DAYS • 4,650 PUSHUPS
</p>
</div>
</div>
);
}

function MainApp({ user }) {
const [profiles, setProfiles] = useState([]);
const [todayCompletions, setTodayCompletions] = useState([]);
  const [todayContent, setTodayContent] = useState(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);
const [currentSet, setCurrentSet] = useState(1);
const [resting, setResting] = useState(false);
const [restSeconds, setRestSeconds] = useState(300);
const [workoutStartedAt, setWorkoutStartedAt] = useState(null);
const [savingWorkout, setSavingWorkout] = useState(false);
  const [workoutSuccess, setWorkoutSuccess] = useState(false);

useEffect(() => {
loadGroup();
loadTodayContent();
resumeWorkout();
}, []);
useEffect(() => {
if (!resting) return;

if (restSeconds <= 0) {
setResting(false);
setRestSeconds(300);
return;
}

const timer = setInterval(() => {
setRestSeconds((seconds) => seconds - 1);
}, 1000);

return () => clearInterval(timer);
}, [resting, restSeconds]);

  const resumeWorkout = async () => {
const today = new Date().toISOString().slice(0, 10);

const { data, error } = await supabase
.from("daily_completions")
.select("*")
.eq("user_id", user.id)
.eq("completion_date", today)
.maybeSingle();

if (error) {
console.error("Could not restore workout:", error);
return;
}

// No workout started today, or today's workout is already finished.
if (!data || data.workout_complete) {
return;
}

let nextSet = 1;

if (data.set_2) {
nextSet = 3;
} else if (data.set_1) {
nextSet = 2;
}

setCurrentSet(nextSet);
setWorkoutOpen(true);

if (data.rest_until) {
const secondsLeft = Math.max(
0,
Math.ceil(
(new Date(data.rest_until).getTime() - Date.now()) / 1000
)
);

if (secondsLeft > 0) {
setRestSeconds(secondsLeft);
setResting(true);
} else {
setRestSeconds(300);
setResting(false);

await saveWorkoutProgress({
rest_until: null,
});
}
}
};
  const loadTodayContent = async () => {
const today = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});

const { data, error } = await supabase
.from("daily_content")
.select("*")
.eq("challenge_date", today)
.maybeSingle();

if (error) {
console.error("Could not load today's content:", error);
return;
}

setTodayContent(data);
};
const loadGroup = async () => {
const { data: profileData } = await supabase
.from("profiles")
.select("*")
.order("created_at", { ascending: true });

if (profileData) {
setProfiles(profileData);
}

const today = new Date().toISOString().slice(0, 10);

const { data: completionData } = await supabase
.from("daily_completions")
.select("*")
.eq("completion_date", today);

if (completionData) {
setTodayCompletions(completionData);
}
};
const getToday = () => new Date().toISOString().slice(0, 10);

const saveWorkoutProgress = async (updates) => {
const today = getToday();

const { error } = await supabase
.from("daily_completions")
.upsert(
{
user_id: user.id,
completion_date: today,
...updates,
},
{
onConflict: "user_id,completion_date",
}
);

if (error) {
console.error("Could not save workout progress:", error);
return false;
}

return true;
};
  const startWorkout = () => {
setCurrentSet(1);
setResting(false);
setRestSeconds(300);
setWorkoutStartedAt(Date.now());
setWorkoutOpen(true);
};

const finishSet = async () => {
if (savingWorkout) return;

setSavingWorkout(true);

if (currentSet < 3) {
const restUntil = new Date(Date.now() + 5 * 60 * 1000);

const updates =
currentSet === 1
? {
set_1: true,
set_2: false,
set_3: false,
workout_complete: false,
rest_until: restUntil.toISOString(),
}
: {
set_1: true,
set_2: true,
set_3: false,
workout_complete: false,
rest_until: restUntil.toISOString(),
};

const saved = await saveWorkoutProgress(updates);

if (!saved) {
alert("Your set could not be saved. Please try again.");
setSavingWorkout(false);
return;
}

setCurrentSet((set) => set + 1);
setRestSeconds(300);
setResting(true);
setSavingWorkout(false);
return;
}

await finishWorkout();
};

const skipRest = async () => {
await saveWorkoutProgress({
rest_until: null,
});

setResting(false);
setRestSeconds(300);
};

const finishWorkout = async () => {
if (savingWorkout) return;

setSavingWorkout(true);

const today = new Date().toISOString().slice(0, 10);

const workoutSeconds = workoutStartedAt
? Math.floor((Date.now() - workoutStartedAt) / 1000)
: null;

const { error } = await supabase
.from("daily_completions")
.upsert(
{
user_id: user.id,
completion_date: today,
set_1: true,
set_2: true,
set_3: true,
workout_complete: true,
completed_at: new Date().toISOString(),
workout_seconds: workoutSeconds,
eliminated: false,
  rest_until: null,
},
{
onConflict: "user_id,completion_date",
}
);

if (error) {
alert(`Could not save workout: ${error.message}`);
setSavingWorkout(false);
return;
}

setResting(false);
setCurrentSet(1);
setRestSeconds(300);
setWorkoutStartedAt(null);
setSavingWorkout(false);

await loadGroup();

setWorkoutSuccess(true);
};

const formatTime = (seconds) => {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;

return `${String(minutes).padStart(2, "0")}:${String(
remainingSeconds
).padStart(2, "0")}`;
};
const signOut = async () => {
await supabase.auth.signOut();
};

const completedToday = (profileId) =>
todayCompletions.some(
(item) =>
item.user_id === profileId && item.workout_complete === true
);
  if (workoutSuccess) {
return (
<div className="success-screen">
<div className="success-content">
<div className="success-check">✓</div>

<p className="success-eyebrow">
DAY COMPLETE
</p>

<div className="success-number">
150
<span>/150</span>
</div>

<h1>CHALLENGE COMPLETE</h1>

<p className="success-quote">
“You kept your word today.”
</p>

<div className="success-stats">
<div>
<strong>3</strong>
<span>SETS</span>
</div>

<div>
<strong>150</strong>
<span>PUSHUPS</span>
</div>

<div>
<strong>✓</strong>
<span>DAY COMPLETE</span>
</div>
</div>

<button
className="success-button"
onClick={() => {
setWorkoutSuccess(false);
setWorkoutOpen(false);
}}
>
RETURN HOME
</button>

<p className="success-motto">
DISCIPLINE BUILDS FREEDOM
</p>
</div>
</div>
);
}
if (workoutOpen) {
return (
<div className="workout-screen">
<div className="workout-photo">
<button
className="workout-back"
onClick={() => setWorkoutOpen(false)}
>
←
</button>

<div className="workout-photo-title">
<span>TODAY'S CHALLENGE</span>
<strong>150 PUSHUPS</strong>
</div>
</div>

<div className="workout-content">
<p className="workout-set-label">
SET {currentSet} OF 3
</p>

{!resting ? (
<>
<h1>50 PUSHUPS</h1>

<div className="rep-count">
50
<span> / 50</span>
</div>

<p className="workout-instruction">
Complete 50 pushups at your own pace.
<br />
Tap below when the set is finished.
</p>

<button
className="workout-complete-button"
onClick={finishSet}
disabled={savingWorkout}
>
{savingWorkout
? "SAVING..."
: currentSet === 3
? "FINISH 150 PUSHUPS"
: `MARK SET ${currentSet} COMPLETE`}
</button>
</>
) : (
<div className="rest-card">
<p className="rest-label">
SET {currentSet - 1} COMPLETE
</p>

<h2>REST</h2>

<div className="rest-time">
{formatTime(restSeconds)}
</div>

<p>
Take five minutes to recover before Set {currentSet}.
</p>

<button
className="skip-rest-button"
onClick={skipRest}
>
START SET {currentSet} EARLY
</button>
</div>
)}

<div className="set-progress">
{[1, 2, 3].map((set) => {
const finished =
set < currentSet ||
(currentSet === 3 && savingWorkout);

const active =
set === currentSet && !resting;

return (
<div
className={`set-step ${
finished ? "finished" : ""
} ${active ? "active" : ""}`}
key={set}
>
<div>{finished ? "✓" : set}</div>
<span>SET {set}</span>
</div>
);
})}
</div>

<p className="workout-motto">
DISCIPLINE BUILDS FREEDOM
</p>
</div>
</div>
);
}
return (
<div className="app">
<header className="header">
<div className="brand-mark">
<Shield size={22} />
</div>

<div>
<div className="brand">CODE OF HONOR</div>
<div className="challenge-label">OCTOBER CHALLENGE</div>
</div>

<button className="logout-button" onClick={signOut}>
<LogOut size={18} />
</button>
</header>

<main>
<section className="day-heading">
<p className="eyebrow">
{todayContent
? `DAY ${todayContent.day_number} • OCTOBER ${todayContent.day_number}`
: "CODE OF HONOR"}
</p>

<h1>
{todayContent
? `Day ${todayContent.day_number}.`
: "The challenge begins October 1."}
</h1>

<p className="quote">
{todayContent
? `“${todayContent.quote}”`
: "Prepare yourself. October 1 — October 31."}
</p>
</section>

<section className="challenge-card">


<p className="eyebrow">THERE IS NO TOMORROW</p>

<div className="big-number">150</div>
<div className="pushups">PUSHUPS</div>

<div className="workout-meta">
<span>3 × 50</span>
<span>•</span>
<span>5 MIN RESTS</span>
</div>

<button
className="primary-button"
onClick={startWorkout}
>
START WORKOUT
</button>
</section>

<section className="plus-one">
<div className="plus-one-label">TODAY'S +1</div>
<p>
Reach out to someone you haven't spoken to in a while.
</p>

<button className="small-button">
<Circle size={18} />
MARK COMPLETE
</button>
</section>

<section className="group-section">
<div className="section-title">
<h2>THE GROUP</h2>
<span>{profiles.length} MEMBERS</span>
</div>

{profiles.map((profile) => {
const complete = completedToday(profile.id);

return (
<div className="member" key={profile.id}>
<div className="avatar">
{profile.display_name?.charAt(0)?.toUpperCase() || "?"}
</div>

<div className="member-info">
<strong>{profile.display_name}</strong>
<span>@{profile.username}</span>
</div>

{complete ? (
<CheckCircle2 className="complete" />
) : (
<Circle className="incomplete" />
)}
</div>
);
})}
</section>
</main>

<nav className="bottom-nav">
<button className="nav-active">
<Flame size={21} />
TODAY
</button>

<button>
<Shield size={21} />
CHALLENGE
</button>

<button>
<Circle size={21} />
PROFILE
</button>
</nav>
</div>
);
}

export default function App() {
const [session, setSession] = useState(undefined);

useEffect(() => {
supabase.auth.getSession().then(({ data }) => {
setSession(data.session);
});

const {
data: { subscription },
} = supabase.auth.onAuthStateChange((_event, newSession) => {
setSession(newSession);
});

return () => subscription.unsubscribe();
}, []);

if (session === undefined) {
return <div className="loading-screen">CODE OF HONOR</div>;
}

if (!session) {
return <AuthScreen />;
}

return <MainApp user={session.user} />;
}
