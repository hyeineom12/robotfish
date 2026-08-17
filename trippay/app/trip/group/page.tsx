"use client";

import { useRouter } from "next/navigation";
import { useTrip } from "@/components/store";
import { MEMBERS } from "@/lib/demo";
import { PROFILES } from "@/lib/catalog";
import { Avatar, Body, Card, Footer, Notice, Screen, SectionTitle, TopBar } from "@/components/ui";

export default function GroupInvite() {
  const router = useRouter();
  const { state, set } = useTrip();

  const toggle = (id: string) => {
    if (id === "me") return;
    const has = state.memberIds.includes(id);
    const memberIds = has ? state.memberIds.filter((m) => m !== id) : [...state.memberIds, id];
    // sanitize가 "그룹인데 1명"인 상태를 solo로 되돌리기 때문에, 2명이 되는 순간
    // 여기서 mode를 다시 켜야 한다. 안 그러면 결제 룰렛·나눠 내기가 통째로 사라진다.
    set({ memberIds, mode: memberIds.length > 1 ? "group" : state.mode });
  };

  return (
    <Screen>
      <TopBar title="같이 갈 사람 초대하기" back="/trip/new" />
      <Body>
        <Card className="bg-surface shadow-none">
          <div className="label mb-1.5">초대 링크</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-xl bg-white px-3 py-2 text-[12px] text-ink-500">
              tripfin.app/join/9F2K-7XQA
            </code>
            <button className="btn-ghost px-3 py-2 text-[12px]">복사</button>
          </div>
          <p className="mt-2 text-[11px] text-ink-300">
            초대받은 사람이 소비 데이터를 연결하면 그룹 성향에 바로 반영돼요.
          </p>
        </Card>

        <SectionTitle hint={`${state.memberIds.length}명 선택함`}>친구 목록</SectionTitle>
        <div className="space-y-2">
          {MEMBERS.map((m) => {
            const selected = state.memberIds.includes(m.id);
            const p = PROFILES[m.profileId];
            return (
              <button key={m.id} onClick={() => toggle(m.id)} className="w-full text-left" disabled={m.isMe}>
                <Card
                  className={`flex items-center gap-3 transition ${
                    selected ? "border-2 border-brand-500" : "border-2 border-transparent"
                  } ${m.isMe ? "opacity-90" : "hover:bg-surface"}`}
                >
<Avatar src={m.photo} name={m.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold">{m.name}</span>
                      {m.isMe && <span className="chip bg-ink-900 text-white">나</span>}
                    </div>
                    <div className="truncate text-[11.5px] text-ink-500">{p.label}</div>
                  </div>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] ${
                      selected ? "bg-brand-600 text-white" : "bg-surface text-ink-300"
                    }`}
                  >
                    ✓
                  </span>
                </Card>
              </button>
            );
          })}
        </div>

        <Notice tone="info">
          예산은 여유가 가장 적은 사람에게 맞춰요. 아무도 부담스럽지 않은 금액부터 제안해요.
        </Notice>
      </Body>
      <Footer>
        <button
          onClick={() => {
            set({ mode: "group" });
            router.push("/trip/group-profile");
          }}
          disabled={state.memberIds.length < 2}
          className="btn-primary w-full"
        >
          {state.memberIds.length < 2 ? "한 명 이상 선택해 주세요" : `${state.memberIds.length}명으로 시작하기`}
        </button>
      </Footer>
    </Screen>
  );
}
