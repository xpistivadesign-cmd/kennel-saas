import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

import {
THEMES,
createTheme
}
from "@/lib/theme/tokens";

export const dynamic="force-dynamic";

export default async function ProtectedLayout({
children
}:{
children:React.ReactNode
}){

const supabase=
await createServerSupabase();

const {
data:{user}
}
=
await supabase.auth.getUser();

if(!user)
redirect("/login");

const {
data
}
=
await supabase
.from("branding_settings")
.select("*")
.eq("user_id",user.id)
.maybeSingle();

const theme=
createTheme(data||{});

const cards=[
`${theme.primary}10`,
`${theme.primary}08`,
`${theme.accent}12`,
`${theme.primary}06`,
`${theme.accent}08`
];

const nav=[

["/dashboard","Dashboard","📊"],

["/dogs","Dogs","🐕"],

["/litters","Litters","🐾"],

["/heats","Heats","🩸"],

["/pedigree","Pedigree","🧬"],

["/shows","Shows","🏆"],

["/settings","Settings","⚙️"],

["/settings/branding","Appearance","🎨"]

];

return(

<div
style={{

background:theme.bg,

color:theme.text,

minHeight:"100vh",

fontFamily:theme.font,

display:"flex"

}}
>

<style>{`

:root{

--primary:${theme.primary};

--accent:${theme.accent};

--surface:${theme.surface};

--radius:${theme.radius};

}

.custom-card{

background:
linear-gradient(
180deg,
rgba(255,255,255,.04),
transparent
),

var(--surface);

backdrop-filter:
blur(22px);

border:
1px solid rgba(255,255,255,.08);

border-radius:
var(--radius);

}

.dashboard-card:nth-child(1){
background:${cards[0]};
}

.dashboard-card:nth-child(2){
background:${cards[1]};
}

.dashboard-card:nth-child(3){
background:${cards[2]};
}

.dashboard-card:nth-child(4){
background:${cards[3]};
}

.dashboard-card:nth-child(5){
background:${cards[4]};
}

button{

background:
linear-gradient(
90deg,
var(--primary),
var(--accent)
);

}

`}</style>

<aside
className="w-72 p-6 border-r"
style={{
borderColor:"#ffffff10"
}}
>

<div
className="text-3xl font-black mb-8"
>
⚡ Kennel
</div>

<nav
className="space-y-2"
>

{
nav.map(
([href,label,icon])=>(

<Link
key={href}
href={href}
className="
custom-card
flex
gap-3
px-4
py-3
"
>

<span>
{icon}
</span>

{label}

</Link>

))
}

</nav>

</aside>

<main
className="
flex-1
p-10
"
>

{children}

</main>

</div>

);

}
