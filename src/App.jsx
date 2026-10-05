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
options: {
data: {
display_name: displayName.trim(),
username: cleanUsername,
},
},
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
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
  const [groupCompletions, setGroupCompletions] = useState([]);
  const [todayContent, setTodayContent] = useState(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);
const [currentSet, setCurrentSet] = useState(1);
const [resting, setResting] = useState(false);
const [restSeconds, setRestSeconds] = useState(300);
  const [restEndsAt, setRestEndsAt] = useState(null);
  const [setSeconds, setSetSeconds] = useState(150);
const [setEndsAt, setSetEndsAt] = useState(null);
const [workoutStartedAt, setWorkoutStartedAt] = useState(null);
const [savingWorkout, setSavingWorkout] = useState(false);
  const [workoutSuccess, setWorkoutSuccess] = useState(false);
  const [finaleSuccess, setFinaleSuccess]= useState(false);
  const [activePage, setActivePage] = useState("today");
const [builders, setBuilders] = useState([]);
const [builderCompletions, setBuilderCompletions] = useState([]);
const [openBuilder, setOpenBuilder] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
const [myCompletions, setMyCompletions] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
const [editingBio, setEditingBio] = useState(false);
const [bioDraft, setBioDraft] = useState("");
const [savingBio, setSavingBio] = useState(false);
const ensureProfile = async () => {
const { data: existingProfile, error: checkError } = await supabase
.from("profiles")
.select("id")
.eq("id", user.id)
.maybeSingle();

if (checkError) {
console.error("Could not check profile:", checkError);
return;
}

if (existingProfile) return;

const metadata = user.user_metadata || {};

const { error: insertError } = await supabase
.from("profiles")
.insert({
id: user.id,
username:
metadata.username ||
user.email?.split("@")[0]?.toLowerCase() ||
`member-${user.id.slice(0, 6)}`,
display_name:
metadata.display_name ||
user.email?.split("@")[0] ||
"Member",
is_active: true,
});

if (insertError) {
console.error("Could not create profile:", insertError);
}
};

useEffect(() => {
const initializeApp = async () => {
await ensureProfile();

await Promise.all([
loadGroup(),
loadTodayContent(),
loadBuilders(),
loadProfileData(),
resumeWorkout(),
]);
};

initializeApp();
}, []);
useEffect(() => {
if (!resting || !restEndsAt) return;

const updateTimer = () => {
const remaining = Math.max(
0,
Math.ceil((restEndsAt - Date.now()) / 1000)
);

setRestSeconds(remaining);

if (remaining <= 0) {
setResting(false);
setRestEndsAt(null);
setRestSeconds(300);
  setSetSeconds(150);
setSetEndsAt(Date.now() + 150 * 1000);
}
};

updateTimer();

const timer = setInterval(updateTimer, 1000);

const handleVisibilityChange = () => {
if (document.visibilityState === "visible") {
updateTimer();
}
};

document.addEventListener(
"visibilitychange",
handleVisibilityChange
);

return () => {
clearInterval(timer);
document.removeEventListener(
"visibilitychange",
handleVisibilityChange
);
};
}, [resting, restEndsAt]);

  useEffect(() => {
if (!workoutOpen || resting || !setEndsAt) return;

const updateSetTimer = () => {
const remaining = Math.max(
0,
Math.ceil((setEndsAt - Date.now()) / 1000)
);

setSetSeconds(remaining);
};

updateSetTimer();

const timer = setInterval(updateSetTimer, 1000);

const handleVisibilityChange = () => {
if (document.visibilityState === "visible") {
updateSetTimer();
}
};

document.addEventListener(
"visibilitychange",
handleVisibilityChange
);

return () => {
clearInterval(timer);
document.removeEventListener(
"visibilitychange",
handleVisibilityChange
);
};
}, [workoutOpen, resting, setEndsAt]);

  const resumeWorkout = async () => {
const today = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});

if (today < "2026-10-01" || today > "2026-10-31") {
return;
}
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
  setRestEndsAt(new Date(data.rest_until).getTime());
setResting(true);
} else {
setRestSeconds(300);
  setRestEndsAt(null);
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
  const loadBuilders = async () => {
const { data: builderData, error: builderError } = await supabase
.from("builders")
.select("*")
.order("id", { ascending: true });

if (builderError) {
console.error("Could not load Builders:", builderError);
return;
}

const { data: completionData, error: completionError } = await supabase
.from("builder_completions")
.select("*")
.eq("user_id", user.id);

if (completionError) {
console.error("Could not load Builder completions:", completionError);
return;
}

setBuilders(builderData || []);
setBuilderCompletions(completionData || []);
};
  const loadProfileData = async () => {
const { data: profileData, error: profileError } = await supabase
.from("profiles")
.select("*")
.eq("id", user.id)
.maybeSingle();

if (profileError) {
console.error("Could not load profile:", profileError);
} else {
setMyProfile(profileData);
}

const { data: completionData, error: completionError } =
await supabase
.from("daily_completions")
.select("*")
.eq("user_id", user.id)
.order("completion_date", { ascending: true });

if (completionError) {
console.error(
"Could not load completion history:",
completionError
);
} else {
setMyCompletions(completionData || []);
}
};
const loadGroup = async () => {
const { data: profileData } = await supabase
.from("profiles")
.select("*")
.order("created_at", { ascending: true });

if (profileData) {
setProfiles(profileData);
}

const today = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});
const { data: completionData } = await supabase
.from("daily_completions")
.select("*")
.eq("completion_date", today);

if (completionData) {
setTodayCompletions(completionData);
}
  const { data: historyData, error: historyError } = await supabase
.from("daily_completions")
.select("user_id, completion_date, workout_complete")
.eq("workout_complete", true)
.order("completion_date", { ascending: true });

if (historyError) {
console.error("Could not load group history:", historyError);
} else {
setGroupCompletions(historyData || []);
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
const now = new Date();

const newYorkNow = new Date(
now.toLocaleString("en-US", {
timeZone: "America/New_York",
})
);

const challengeStart = new Date(2026, 9, 1, 0, 0, 0);
const challengeEnd = new Date(2026, 10, 1, 0, 0, 0);

if (newYorkNow < challengeStart) {
alert("CODE OF HONOR begins October 1.");
return;
}

if (newYorkNow >= challengeEnd) {
alert("The October challenge has ended.");
return;
}
const alreadyCompleted = todayCompletions.some(
(item) =>
item.user_id === user.id &&
item.workout_complete === true
);

if (alreadyCompleted) {
alert("Today's 150 pushups are already complete.");
return;
}
setCurrentSet(1);
setResting(false);
setRestSeconds(300);
  setSetSeconds(150);
setSetEndsAt(Date.now() + 150 * 1000);
setWorkoutStartedAt(Date.now());
setWorkoutOpen(true);
};

const finishSet = async () => {
if (savingWorkout) return;

setSavingWorkout(true);
  setSetEndsAt(null);
setSetSeconds(150);

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
  setSetEndsAt(Date.now() + setSeconds * 1000);

setSavingWorkout(false);
return;
}

setCurrentSet((set) => set + 1);
setRestSeconds(300);
setRestEndsAt(restUntil.getTime());
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

  setRestEndsAt(null);
setResting(false);
setRestSeconds(300);
  setSetSeconds(150);
setSetEndsAt(Date.now() + 150 * 1000);
};

const finishWorkout = async () => {
if (savingWorkout) return;

setSavingWorkout(true);

const today = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});
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
  setRestEndsAt(null);

await loadGroup();
  await loadProfileData();

const completionDay = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});

if (completionDay === "2026-10-31") {
setFinaleSuccess(true);
} else {
setWorkoutSuccess(true);
}
};

const formatTime = (seconds) => {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;

return `${String(minutes).padStart(2, "0")}:${String(
remainingSeconds
).padStart(2, "0")}`;
};
  const builderIsComplete = (builderId) => {
return builderCompletions.some(
(completion) => completion.builder_id === builderId
);
};

const toggleBuilder = async (builderId) => {
const existing = builderCompletions.find(
(completion) => completion.builder_id === builderId
);

if (existing) {
const { error } = await supabase
.from("builder_completions")
.delete()
.eq("id", existing.id)
.eq("user_id", user.id);

if (error) {
alert(`Could not update Builder: ${error.message}`);
return;
}
} else {
const { error } = await supabase
.from("builder_completions")
.insert({
user_id: user.id,
builder_id: builderId,
});

if (error) {
alert(`Could not complete Builder: ${error.message}`);
return;
}
}

await loadBuilders();
};
  const saveBio = async () => {
if (savingBio) return;

setSavingBio(true);

const cleanBio = bioDraft.trim().slice(0, 180);

const { error } = await supabase
.from("profiles")
.update({ bio: cleanBio })
.eq("id", user.id);

if (error) {
alert(`Could not save bio: ${error.message}`);
setSavingBio(false);
return;
}

await loadProfileData();
await loadGroup();

setEditingBio(false);
setSavingBio(false);
};
  const uploadAvatar = async (event) => {
const file = event.target.files?.[0];

if (!file) return;

if (!file.type.startsWith("image/")) {
alert("Please choose an image file.");
return;
}

if (file.size > 5 * 1024 * 1024) {
alert("Please choose an image smaller than 5 MB.");
return;
}

setUploadingAvatar(true);

const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
const filePath = `${user.id}/profile.${extension}`;

const { error: uploadError } = await supabase.storage
.from("avatars")
.upload(filePath, file, {
upsert: true,
contentType: file.type,
});

if (uploadError) {
alert(`Could not upload photo: ${uploadError.message}`);
setUploadingAvatar(false);
return;
}

const {
data: { publicUrl },
} = supabase.storage
.from("avatars")
.getPublicUrl(filePath);

const avatarUrl = `${publicUrl}?v=${Date.now()}`;

const { error: profileError } = await supabase
.from("profiles")
.update({
avatar_url: avatarUrl,
})
.eq("id", user.id);

if (profileError) {
alert(`Could not save photo: ${profileError.message}`);
setUploadingAvatar(false);
return;
}

await loadProfileData();
await loadGroup();

setUploadingAvatar(false);

// Allows choosing the same file again later if desired.
event.target.value = "";
};
const signOut = async () => {
await supabase.auth.signOut();
};
const getMemberStreak = (profileId) => {
const completedDates = new Set(
groupCompletions
.filter(
(item) =>
item.user_id === profileId &&
item.workout_complete === true
)
.map((item) => item.completion_date)
);

if (completedDates.size === 0) return 0;

const todayString = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});

// No official streaks before October 1.
if (todayString < "2026-10-01") return 0;

let cursor = new Date(`${todayString}T12:00:00`);
const todayComplete = completedDates.has(todayString);

// During the day, not completing today's workout yet
// should NOT destroy yesterday's existing streak.
if (!todayComplete) {
cursor.setDate(cursor.getDate() - 1);
}

let streak = 0;

while (true) {
const year = cursor.getFullYear();
const month = String(cursor.getMonth() + 1).padStart(2, "0");
const day = String(cursor.getDate()).padStart(2, "0");
const dateString = `${year}-${month}-${day}`;

if (dateString < "2026-10-01") break;
if (!completedDates.has(dateString)) break;

streak += 1;
cursor.setDate(cursor.getDate() - 1);
}

return streak;
};
  const getTodayCompletion = (profileId) => {
return todayCompletions.find(
(item) =>
item.user_id === profileId &&
item.workout_complete === true
);
};

const rankedProfiles = [...profiles].sort((a, b) => {
const streakA = getMemberStreak(a.id);
const streakB = getMemberStreak(b.id);

// Longest streak always ranks first.
if (streakB !== streakA) {
return streakB - streakA;
}

// If streaks are tied, someone who completed today
// ranks above someone who has not.
const completionA = getTodayCompletion(a.id);
const completionB = getTodayCompletion(b.id);

if (completionA && !completionB) return -1;
if (!completionA && completionB) return 1;

// If both completed today, most recent completion ranks first.
if (completionA && completionB) {
const timeA = new Date(completionA.completed_at || 0).getTime();
const timeB = new Date(completionB.completed_at || 0).getTime();

return timeB - timeA;
}

// Stable fallback.
return (a.display_name || "").localeCompare(
b.display_name || ""
);
});

const completedToday = (profileId) =>
todayCompletions.some(
(item) =>
item.user_id === profileId && item.workout_complete === true
);
  const myWorkoutComplete = completedToday(user.id);
  const totalMembers = profiles.length;

const completedTodayCount = profiles.filter((profile) =>
completedToday(profile.id)
).length;

  if (viewingProfile) {
const memberDays = groupCompletions.filter(
(item) =>
item.user_id === viewingProfile.id &&
item.workout_complete === true
);

const memberDaysCompleted = memberDays.length;
const memberPushups = memberDaysCompleted * 150;
const memberStreak = getMemberStreak(viewingProfile.id);

const memberBuilderCount = builderCompletions.filter(
(item) => item.user_id === viewingProfile.id
).length;

return (
<div className="public-profile-screen">
<header className="public-profile-header">
<button
className="public-profile-back"
onClick={() => setViewingProfile(null)}
>
←
</button>

<div>
<div className="brand">CODE OF HONOR</div>
<div className="challenge-label">MEMBER PROFILE</div>
</div>
</header>

<main className="public-profile-main">
<section className="public-profile-identity">
<div className="public-profile-avatar">
{viewingProfile.avatar_url ? (
<img
src={viewingProfile.avatar_url}
alt={viewingProfile.display_name || "Member"}
/>
) : (
viewingProfile.display_name
?.charAt(0)
?.toUpperCase() || "?"
)}
</div>

<h1>{viewingProfile.display_name}</h1>
<p className="public-username">
@{viewingProfile.username}
</p>

{viewingProfile.bio && (
<p className="public-profile-bio">
{viewingProfile.bio}
</p>
)}
</section>

<section className="public-profile-stats">
<div>
<strong>{memberDaysCompleted}</strong>
<span>DAYS</span>
</div>

<div>
<strong>{memberPushups.toLocaleString()}</strong>
<span>PUSHUPS</span>
</div>

<div>
<strong>{memberStreak}</strong>
<span>DAY STREAK</span>
</div>
</section>

<section className="public-code-card">
<p className="eyebrow">THE CODE</p>

<div className="code-stat-row">
<span>DAYS COMPLETED</span>
<strong>{memberDaysCompleted} / 31</strong>
</div>

<div className="code-stat-row">
<span>CURRENT STREAK</span>
<strong>
{memberStreak} {memberStreak === 1 ? "DAY" : "DAYS"}
</strong>
</div>

<div className="code-stat-row">
<span>PUSHUPS COMPLETED</span>
<strong>{memberPushups.toLocaleString()}</strong>
</div>
</section>

<p className="public-profile-motto">
DISCIPLINE BUILDS FREEDOM
</p>
</main>
</div>
);
}
  if (activePage === "profile") {
const completedDays = myCompletions.filter(
(item) => item.workout_complete === true
);
const daysCompleted = completedDays.length;
const totalPushups = daysCompleted * 150;
const buildersCompleted = builderCompletions.length;

const completedDayNumbers = completedDays
.map((item) => {
const parts = item.completion_date?.split("-");
return parts ? Number(parts[2]) : null;
})
.filter(Boolean);

const sortedDays = [...completedDayNumbers].sort((a, b) => a - b);

let currentStreak = 0;

for (let i = sortedDays.length - 1; i >= 0; i--) {
if (
i === sortedDays.length - 1 ||
sortedDays[i] === sortedDays[i + 1] - 1
) {
currentStreak += 1;
} else {
break;
}
}

const now = new Date();

const newYorkToday = new Date(
now.toLocaleString("en-US", {
timeZone: "America/New_York",
})
);

let daysRemaining = 31;

if (
newYorkToday.getFullYear() === 2026 &&
newYorkToday.getMonth() === 9
) {
daysRemaining = Math.max(0, 31 - newYorkToday.getDate());
} else if (
newYorkToday > new Date("2026-10-31T23:59:59")
) {
daysRemaining = 0;
}

return (
<div className="profile-screen">
<header className="profile-header">
<div className="brand-mark">
<Shield size={22} />
</div>

<div>
<div className="brand">CODE OF HONOR</div>
<div className="challenge-label">OCTOBER CHALLENGE</div>
</div>
</header>

<main className="profile-main">
<section className="profile-identity">
<div className="profile-avatar">
{myProfile?.avatar_url ? (
<img
src={myProfile.avatar_url}
alt="Profile"
className="profile-avatar-image"
/>
) : (
myProfile?.display_name
?.charAt(0)
?.toUpperCase() || "?"
)}
</div>

<label className="change-photo-button">
{uploadingAvatar ? "UPLOADING..." : "CHANGE PHOTO"}

<input
type="file"
accept="image/*"
onChange={uploadAvatar}
disabled={uploadingAvatar}
hidden
/>
</label>


<h1>{myProfile?.display_name || "MEMBER"}</h1>

<p>
@{myProfile?.username || "codeofhonor"}
</p>
  {editingBio ? (
<div className="bio-editor">
<textarea
value={bioDraft}
maxLength={180}
placeholder="Write a short bio..."
onChange={(e) => setBioDraft(e.target.value)}
/>

<div className="bio-count">
{bioDraft.length} / 180
</div>

<div className="bio-actions">
<button
onClick={() => {
setEditingBio(false);
setBioDraft(myProfile?.bio || "");
}}
>
CANCEL
</button>

<button
onClick={saveBio}
disabled={savingBio}
>
{savingBio ? "SAVING..." : "SAVE BIO"}
</button>
</div>
</div>
) : (
<>
<p className="profile-bio">
{myProfile?.bio || "No bio yet."}
</p>

<button
className="edit-bio-button"
onClick={() => {
setBioDraft(myProfile?.bio || "");
setEditingBio(true);
}}
>
{myProfile?.bio ? "EDIT BIO" : "ADD BIO"}
</button>
</>
)}

</section>

<section className="profile-progress">
<p className="eyebrow">OCTOBER PROGRESS</p>

<div className="profile-stat-grid">
<div>
<strong>{daysCompleted}</strong>
<span>/ 31 DAYS</span>
</div>

<div>
<strong>{totalPushups.toLocaleString()}</strong>
<span>PUSHUPS</span>
</div>

<div>
<strong>{buildersCompleted}</strong>
<span>/ 16 BUILDERS</span>
</div>
</div>
</section>

<section className="calendar-section">
<div className="profile-section-heading">
<h2>OCTOBER</h2>
<span>31 DAYS</span>
</div>

<div className="october-grid">
{Array.from({ length: 31 }, (_, index) => {
const day = index + 1;
const complete = completedDayNumbers.includes(day);

const todayString = new Date().toLocaleDateString("en-CA", {
timeZone: "America/New_York",
});

const challengeDate = `2026-10-${String(day).padStart(2, "0")}`;

let dayStatus = "future";

if (complete) {
dayStatus = "complete";
} else if (challengeDate === todayString) {
dayStatus = "today";
} else if (
challengeDate < todayString &&
challengeDate >= "2026-10-01"
) {
dayStatus = "missed";
}

return (
<div
className={`calendar-day ${dayStatus}`}
key={day}
>
<span>
{String(day).padStart(2, "0")}
</span>

<strong>
{dayStatus === "complete"
? "✓"
: dayStatus === "missed"
? "—"
: dayStatus === "today"
? "○"
: ""}
</strong>
</div>
);
})}
</div>
</section>

<section className="code-stats">
<p className="eyebrow">THE CODE</p>

<div className="code-stat-row">
<span>CURRENT STREAK</span>
<strong>
{currentStreak} {currentStreak === 1 ? "DAY" : "DAYS"}
</strong>
</div>

<div className="code-stat-row">
<span>PUSHUPS COMPLETED</span>
<strong>{totalPushups.toLocaleString()}</strong>
</div>

<div className="code-stat-row">
<span>BUILDERS COMPLETED</span>
<strong>{buildersCompleted} / 16</strong>
</div>

<div className="code-stat-row">
<span>DAYS REMAINING</span>
<strong>{daysRemaining}</strong>
</div>
</section>

<button
className="profile-signout"
onClick={signOut}
>
SIGN OUT
</button>

<p className="profile-motto">
DISCIPLINE BUILDS FREEDOM
</p>
</main>

<nav className="bottom-nav">
<button onClick={() => setActivePage("today")}>
<Flame size={21} />
TODAY
</button>

<button onClick={() => setActivePage("challenge")}>
<Shield size={21} />
CHALLENGE
</button>

<button className="nav-active">
<Circle size={21} />
PROFILE
</button>
</nav>
</div>
);
}
  if (activePage === "challenge") {
const completedCount = builderCompletions.length;
const progressPercent = (completedCount / 16) * 100;

const categories = [
"DISCIPLINE",
"AWARENESS",
"KINDNESS",
"RELATIONSHIPS",
"COURAGE",
"SACRIFICE",
];

return (
<div className="builders-screen">
<header className="builders-header">
<div className="brand-mark">
<Shield size={22} />
</div>

<div>
<div className="brand">CODE OF HONOR</div>
<div className="challenge-label">OCTOBER CHALLENGE</div>
</div>
</header>

<main className="builders-main">
<section className="builders-intro">
<p className="eyebrow">CODE OF HONOR</p>
<h1>THE 16 BUILDERS</h1>

<p className="builders-subtitle">
Sixteen acts. One month. Complete them all before October 31.
</p>

<div className="builders-progress-row">
<strong>{completedCount} / 16</strong>
<span>COMPLETED</span>
</div>

<div className="builders-progress-track">
<div
className="builders-progress-fill"
style={{ width: `${progressPercent}%` }}
/>
</div>
</section>

{categories.map((category) => {
const categoryBuilders = builders.filter(
(builder) => builder.category === category
);

if (categoryBuilders.length === 0) return null;

return (
<section className="builder-category" key={category}>
<div className="builder-category-title">
{category}
</div>

{categoryBuilders.map((builder) => {
const complete = builderIsComplete(builder.id);
const isOpen = openBuilder === builder.id;

return (
<div
className={`builder-card ${
complete ? "builder-complete" : ""
}`}
key={builder.id}
>
<button
className="builder-summary"
onClick={() =>
setOpenBuilder(isOpen ? null : builder.id)
}
>
<div className="builder-number">
{String(builder.id).padStart(2, "0")}
</div>

<div className="builder-title-area">
<strong>{builder.title}</strong>
<span>{builder.principle}</span>
</div>

<div
className={`builder-status ${
complete ? "complete" : ""
}`}
>
{complete ? "✓" : "+"}
</div>
</button>

{isOpen && (
<div className="builder-details">
<p>{builder.description}</p>

<button
className={`builder-action ${
complete ? "undo" : ""
}`}
onClick={() => toggleBuilder(builder.id)}
>
{complete
? "MARK AS NOT COMPLETE"
: "MARK BUILDER COMPLETE"}
</button>
</div>
)}
</div>
);
})}
</section>
);
})}
</main>

<nav className="bottom-nav">
<button onClick={() => setActivePage("today")}>
<Flame size={21} />
TODAY
</button>

<button className="nav-active">
<Shield size={21} />
CHALLENGE
</button>

<button onClick={() => setActivePage("profile")}>
<Circle size={21} />
PROFILE
</button>
</nav>
</div>
);
}
  if (finaleSuccess) {
return (
<div className="finale-screen">
<div className="finale-content">
<div className="finale-shield">
<Shield size={30} />
</div>

<p className="finale-eyebrow">CODE OF HONOR</p>

<h1>THE STANDARD REMAINS.</h1>

<p className="finale-quote">
“The challenge ends today. The standard doesn't.”
</p>

<div className="finale-total">
<strong>4,650</strong>
<span>PUSHUPS COMPLETED</span>
</div>

<div className="finale-stats">
<div>
<strong>31</strong>
<span>DAYS</span>
</div>

<div>
<strong>{builderCompletions.length}/16</strong>
<span>BUILDERS</span>
</div>

<div>
<strong>ONE</strong>
<span>CODE</span>
</div>
</div>

<div className="finale-message">
<p>YOU KEPT YOUR WORD.</p>

<strong>
{builderCompletions.length === 16
? "CODE OF HONOR COMPLETE"
: "31-DAY WORKOUT COMPLETE"}
</strong>

{builderCompletions.length < 16 && (
<span className="finale-builders-note">
{16 - builderCompletions.length}{" "}
{16 - builderCompletions.length === 1 ? "BUILDER" : "BUILDERS"} REMAIN
</span>
)}
</div>

<button
className="finale-button"
onClick={() => {
setFinaleSuccess(false);
setWorkoutOpen(false);
}}
>
RETURN HOME
</button>

<p className="finale-date">
OCTOBER 1 — OCTOBER 31, 2026
</p>

<p className="finale-motto">
DISCIPLINE BUILDS FREEDOM
</p>
</div>
</div>
);
}
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

  <div className={`set-timer ${setSeconds === 0 ? "expired" : ""}`}>
<span className="set-timer-label">
{setSeconds === 0 ? "TIME'S UP" : "TIME REMAINING"}
</span>

<strong>
{Math.floor(setSeconds / 60)}:
{String(setSeconds % 60).padStart(2, "0")}
</strong>

{setSeconds === 0 && (
<span className="set-timer-message">
FINISH YOUR 50
</span>
)}
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
className={`primary-button ${
myWorkoutComplete ? "workout-done-button" : ""
}`}
onClick={startWorkout}
disabled={myWorkoutComplete}
>
{!todayContent
? "BEGINS OCTOBER 1"
: myWorkoutComplete
? "TODAY'S WORKOUT COMPLETE ✓"
: "START WORKOUT"}
</button>
</section>


<section className="group-section">
<div className="group-header">
<h2>THE GROUP</h2>

<div className="group-live-stats">
<span>
{totalMembers} {totalMembers === 1 ? "MEMBER" : "MEMBERS"}
</span>

<span className="group-stat-divider">•</span>

<span>
{todayContent
? `${completedTodayCount} COMPLETE TODAY`
: "STARTS OCT 1"}
</span>
</div>
</div>

  {todayContent && totalMembers > 0 && (
<div className="group-daily-progress">
<div
className="group-daily-progress-fill"
style={{
width: `${(completedTodayCount / totalMembers) * 100}%`,
}}
/>
</div>
)}

{rankedProfiles.map((profile) => {
const complete = completedToday(profile.id);
  const streak = getMemberStreak(profile.id);

return (
<div
className="member clickable-member"
key={profile.id}
onClick={() => setViewingProfile(profile)}
><div className="avatar">
{profile.avatar_url ? (
<img
src={profile.avatar_url}
alt={profile.display_name || "Member"}
className="member-avatar-image"
/>
) : (
profile.display_name?.charAt(0)?.toUpperCase() || "?"
)}
</div>

<div className="member-info">
<strong>{profile.display_name}</strong>
<span>@{profile.username}</span>

<div className="member-streak">
🔥 {streak} {streak === 1 ? "DAY" : "DAYS"} STREAK
</div>
</div>

<div
className={`member-today-status ${
!todayContent
? "not-done"
: complete
? "done"
: "not-done"
}`}
>
{!todayContent ? (
<>
<Circle size={18} />
<span>STARTS OCT 1</span>
</>
) : complete ? (
<>
<CheckCircle2 size={18} />
<span>COMPLETE</span>
</>
) : (
<>
<Circle size={18} />
<span>NOT YET</span>
</>
)}
</div>
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

<button onClick={() => setActivePage("challenge")}>
<Shield size={21} />
CHALLENGE
</button>

<button onClick={() => setActivePage("profile")}>
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
