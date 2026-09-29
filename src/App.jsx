import React from "react";
import {
Shield,
Flame,
CheckCircle2,
Circle,
Dumbbell,
} from "lucide-react";

export default function App() {
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
</header>

<main>
<section className="day-heading">
<p className="eyebrow">DAY 1 • OCTOBER 1</p>
<h1>Show up.</h1>
<p className="quote">
“You don't have to feel ready. You just have to begin.”
</p>
</section>

<section className="challenge-card">
<div className="challenge-icon">
<Dumbbell size={24} />
</div>

<p className="eyebrow">TODAY'S CHALLENGE</p>

<div className="big-number">150</div>
<div className="pushups">PUSHUPS</div>

<div className="workout-meta">
<span>3 × 50</span>
<span>•</span>
<span>10 MINUTES</span>
</div>

<button className="primary-button">
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
<span>DAY 1</span>
</div>

<div className="member">
<div className="avatar">T</div>
<div className="member-info">
<strong>TJ</strong>
<span>
<Flame size={14} /> 1 day
</span>
</div>
<CheckCircle2 className="complete" />
</div>

<div className="member">
<div className="avatar">R</div>
<div className="member-info">
<strong>RJ</strong>
<span>Not completed yet</span>
</div>
<Circle className="incomplete" />
</div>

<div className="member">
<div className="avatar">C</div>
<div className="member-info">
<strong>Chris</strong>
<span>Not completed yet</span>
</div>
<Circle className="incomplete" />
</div>
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
