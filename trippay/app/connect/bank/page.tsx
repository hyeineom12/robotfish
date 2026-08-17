"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import { INSTITUTIONS, type Institution } from "@/lib/catalog";
import { Body, Card, Footer, Notice, Screen, SectionTitle, TopBar } from "@/components/ui";

function InstitutionLogo({ item }: { item: Institution }) {
  if (item.logo) {
    return (
      // 로고는 28px로만 쓰여 최적화 이득이 없고 SVG가 섞여 있어 img 태그를 그대로 사용.
      // 심벌형(정사각)과 워드마크형(가로로 긴)이 섞여 있어 높이만 고정하고 폭은 타일에 맡긴다.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset(item.logo)} alt="" aria-hidden className="h-7 w-full object-contain" />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ background: item.color ?? "#6b7280" }}
    >
      {item.name.charAt(0)}
    </span>
  );
}

export default function BankConnect() {
  const [selected, setSelected] = useState<string | null>(null);
  const [account, setAccount] = useState("");

  const formatAccount = (v: string) => v.replace(/[^0-9]/g, "").slice(0, 14);
  const filled = !!selected && account.length >= 10;

  return (
    <Screen>
      <TopBar title="내 계좌 연결하기" subtitle="금융기관을 선택하고 계좌번호를 입력해 주세요" back="/connect" />
      <Body>
        {INSTITUTIONS.map((group) => (
          <div key={group.group} className="space-y-2">
            <SectionTitle>{group.group}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelected(item.name)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition ${
                    selected === item.name
                      ? "border-brand-500 bg-brand-50"
                      : "border-ink-300/40 bg-white hover:bg-surface"
                  }`}
                >
                  <InstitutionLogo item={item} />
                  <span
                    className={`text-center text-[11.5px] font-semibold leading-tight ${
                      selected === item.name ? "text-brand-700" : "text-ink-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <Card>
          <div className="label mb-2">계좌번호</div>
          <input
            inputMode="numeric"
            value={account}
            onChange={(e) => setAccount(formatAccount(e.target.value))}
            placeholder="'-' 없이 숫자만 입력해 주세요"
            className="w-full rounded-xl bg-surface px-3.5 py-3 text-[15px] tabular-nums outline-none placeholder:text-[13px] placeholder:text-ink-300"
          />
          {selected && <p className="mt-2 text-[12px] text-ink-500">{selected} 계좌를 연결해요</p>}
        </Card>

        <Notice tone="info">
          연결한 계좌의 최근 6개월 거래내역을 불러와요. 언제든 연결을 해제할 수 있어요.
        </Notice>

        <Notice tone="warn">
          지금은 프로토타입이라 실제 계좌 연결은 되지 않아요. 이전 화면에서 데모 데이터로 체험해 주세요.
        </Notice>
      </Body>
      <Footer>
        <button disabled className="btn-primary w-full">
          {filled ? "다음" : "금융기관과 계좌번호를 입력해 주세요"}
        </button>
      </Footer>
    </Screen>
  );
}
