import { Arrow, Box, DiagramFrame, Label } from "./primitives";

export function ThunderArchitectureDiagram() {
  const fws = ["React", "Next.js", "Vue", "Nuxt", "Express"];
  return (
    <DiagramFrame
      title="Self-service component architecture"
      desc="Five framework SDKs (React, Next.js, Vue, Nuxt, Express) sit on shared framework-agnostic logic and a theme token contract, which talk to the ThunderID Go backend APIs."
      width={760}
      height={380}
      caption="Illustrative architecture. Framework bindings stay thin: behaviour and theming are shared."
    >
      <Label x={20} y={28}>
        YOUR APP
      </Label>
      {fws.map((f, i) => (
        <Box key={f} x={20 + i * 146} y={40} w={132} h={52} label={f} sub="binding" />
      ))}
      {fws.map((f, i) => (
        <Arrow key={f} d={`M${86 + i * 146},94 V146`} />
      ))}
      <Label x={20} y={140}>
        SHARED
      </Label>
      <Box x={20} y={150} w={430} h={64} label="Self-service logic" sub="fetch · validate · state transitions" tone="accent" />
      <Box x={466} y={150} w={274} h={64} label="Theme contract" sub="tokens → CSS custom properties" tone="warm" />
      <Arrow d="M235,216 V286" accent label="HTTPS / REST" lx={300} ly={256} />
      <Label x={20} y={276}>
        BACKEND
      </Label>
      <Box x={20} y={288} w={720} h={64} label="ThunderID (Go)" sub="identity + self-service APIs" />
    </DiagramFrame>
  );
}

export function RobotStateDiagram() {
  return (
    <DiagramFrame
      title="Robot behaviour state machine"
      desc="States: Cruise forward, Stop, Rotate in place with gyro feedback, Check path. Cliff detection has top priority. There is no reverse state."
      width={760}
      height={330}
      caption="Every tick checks cliffs first, then obstacles. Reverse isn't a state, so no code path can produce it."
    >
      <Box x={30} y={120} w={150} h={62} label="CRUISE" sub="forward only" tone="accent" />
      <Box x={250} y={120} w={130} h={62} label="STOP" sub="motors off" />
      <Box x={450} y={120} w={150} h={62} label="ROTATE" sub="gyro closed-loop" tone="warm" />
      <Box x={450} y={240} w={150} h={62} label="CHECK" sub="floor + front clear?" />
      <Box x={250} y={20} w={130} h={52} label="REVERSE" sub="does not exist" tone="danger" />
      <line x1="252" y1="22" x2="378" y2="70" stroke="var(--danger-ink)" strokeWidth="1.5" />
      <Arrow d="M182,140 H248" label="cliff ▸ obstacle" lx={215} ly={132} />
      <Arrow d="M382,151 H448" label="target °" lx={415} ly={143} />
      <Arrow d="M525,184 V238" label="reached" lx={565} ly={216} />
      <Arrow d="M450,271 H105 V184" accent label="clear → drive" lx={300} ly={290} />
      <Arrow d="M602,271 H690 V151 H602" dashed label="blocked: rotate more" lx={690} ly={110} />
      <Label x={30} y={42} tone="danger">
        PRIORITY: CLIFF › OBSTACLE › MOVE
      </Label>
    </DiagramFrame>
  );
}

export function PowerTraceDiagram() {
  return (
    <DiagramFrame
      title="Detection pipeline and where the bug lived"
      desc="Trace goes through windowing, calibration and thresholding into the classifier. The bug: calibration wrote into the shared config threshold that thresholding reads, replacing the user's setting."
      width={760}
      height={300}
      caption="The fix: calibration writes its own state; the effective threshold is computed from baseline + user margin."
    >
      <Box x={20} y={60} w={120} h={58} label="Trace" sub="raw samples" />
      <Box x={170} y={60} w={130} h={58} label="Windowing" />
      <Box x={330} y={60} w={130} h={58} label="Calibration" sub="baseline, σ" tone="warm" />
      <Box x={490} y={60} w={120} h={58} label="Threshold" sub="baseline + k·σ" />
      <Box x={640} y={60} w={100} h={58} label="Model" sub="[CLASSIFIER]" tone="accent" />
      <Arrow d="M142,89 H168" />
      <Arrow d="M302,89 H328" />
      <Arrow d="M462,89 H488" />
      <Arrow d="M612,89 H638" />
      <Box x={410} y={196} w={180} h={58} label="config.threshold" sub="user setting" tone="muted" />
      <Arrow d="M550,194 V120" label="reads" lx={572} ly={160} />
      <path d="M395,120 C395,170 420,200 440,196" fill="none" stroke="var(--danger-ink)" strokeWidth="2" markerEnd="url(#arrow)" />
      <Label x={250} y={178} tone="danger">
        BUG: CALIBRATION OVERWRITES IT
      </Label>
    </DiagramFrame>
  );
}

export function BatteryPipelineDiagram() {
  return (
    <DiagramFrame
      title="EV battery prediction pipeline"
      desc="Battery data flows into feature engineering, then a model, then a Hugging Face Space where visitors run predictions."
      width={760}
      height={170}
      caption="Placeholders in brackets are filled from the project write-up."
    >
      <Box x={20} y={50} w={150} h={62} label="Battery data" sub="[DATASET]" />
      <Box x={210} y={50} w={150} h={62} label="Features" sub="[FEATURES]" />
      <Box x={400} y={50} w={150} h={62} label="Model" sub="[MODEL]" tone="accent" />
      <Box x={590} y={50} w={150} h={62} label="HF Space" sub="public demo" tone="warm" />
      <Arrow d="M172,81 H208" />
      <Arrow d="M362,81 H398" />
      <Arrow d="M552,81 H588" accent />
    </DiagramFrame>
  );
}
