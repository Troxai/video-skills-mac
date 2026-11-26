import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {MU2Video, MU2_DUR} from './MU2';
import {MULVideo, MUL_DUR} from './MUL';
import {MUTVideo, MUT_DUR} from './MUT';
import {MUVVideo, MUV_DUR} from './MUV';
import {MUIVideo, MUI_DUR} from './MUI';
import {NPZVideo, NPZ_DUR} from './NPZ';
import {TBNVideo, TBN_DUR} from './TBN';
import {U17Video, U17_DUR} from './U17';
import {U17SVideo, U17S_DUR} from './U17S';
import {U17NZVideo, U17NZ_DUR} from './U17NZ';
import {KVARAVideo, KVARA_DUR} from './KVARA';
import {SIRALEXVideo, SIRALEX_DUR} from './SIRALEX';
import {U17RVideo, U17R_DUR} from './U17R';
import {KUYTVideo, KUYT_DUR} from './KUYT';
import {CRVVideo, CRV_DUR, CRVMotion, CRVM_DUR, CRVFull, CRVF_DUR} from './CRV';
import {LIVMUVideo, LIVMU_DUR} from './LIVMU';
import {BRUNOVideo, BRUNO_DUR} from './BRUNO';
import {Still} from 'remotion';
import {Thumb} from './Thumbs';
import {PODVideo, POD_DUR} from './POD';
import {POCHVideo, POCH_DUR} from './POCH';
// Khuôn mẫu kênh 90+. Video mới: copy MUL.tsx → <EP>.tsx, thêm Composition ở đây.
export const Root: React.FC = () => <>
  <Composition id="MUL" component={MULVideo} durationInFrames={Math.round(MUL_DUR*30)} fps={30} width={1920} height={1080} />
  <Composition id="MU2" component={MU2Video} durationInFrames={Math.round(MU2_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="MUT" component={MUTVideo} durationInFrames={Math.round(MUT_DUR*30)} fps={30} width={1920} height={1080} />
  <Composition id="MUV" component={MUVVideo} durationInFrames={Math.round(MUV_DUR*30)} fps={30} width={1920} height={1080} />
  <Composition id="MUI" component={MUIVideo} durationInFrames={Math.round(MUI_DUR*30)} fps={30} width={1920} height={1080} />
  <Composition id="POCH" component={POCHVideo} durationInFrames={Math.round(POCH_DUR*30)} fps={30} width={1920} height={1080} />
  <Composition id="NPZ" component={NPZVideo} durationInFrames={Math.round(NPZ_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="TBN" component={TBNVideo} durationInFrames={Math.round(TBN_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="U17" component={U17Video} durationInFrames={Math.round(U17_DUR*30)} fps={30} width={1080} height={1920} />
  <Still id="TH-TBN" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'TÂY BAN NHA VÔ ĐỊCH WORLD CUP 2010', l1: '23 nhà vô địch', l2: 'giờ ở đâu?', figs: [{src: 'tbn/iniesta.png', x: 120, h: 1100}]}} />
  <Still id="TH-U17" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'U17 WORLD CUP · DỰ ĐOÁN', l1: 'Việt Nam vs Bỉ:', l2: 'bạn đoán mấy–mấy?', figs: [{src: 'u17/vn_small.png', x: 100, h: 900}, {src: 'u17/be_giant.png', x: 520, h: 1150}]}} />
  <Still id="TH-U17R" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'U17 WORLD CUP · ĐIỂM SỐ LỊCH SỬ', l1: 'Ghi 3 bàn,', l2: 'vẫn không thắng?', score: 'VIỆT NAM 3–3 NZ', figs: [{src: 'u17r/khang_header.png', x: 40, h: 900}, {src: 'u17r/vn_cheer.png', x: 560, h: 1100}]}} />
  <Still id="TH-SIRALEX" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'MAN UTD · DI SẢN SIR ALEX', l1: '27 năm xây đế chế,', l2: '10 năm phá hỏng', score: '8 HLV · 0 KẾ HOẠCH', figs: [{src: 'siralex/sa_watch.png', x: 60, h: 1150}, {src: 'siralex/barber_chair.png', x: 560, h: 800}]}} />
  <Still id="TH-KVARA" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'PSG · ĐỨT DÂY CHẰNG CHÉO', l1: 'Từ Kvaradona', l2: 'đến cú ngã tuổi 25', score: 'HẠNG 6 QBV 2026', figs: [{src: 'kvara/kv_ucl.png', x: 80, h: 1100}, {src: 'kvara/kv_rehab.png', x: 560, h: 1100}]}} />
  <Still id="TH-U17NZ" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'U17 WORLD CUP · 22:30 TỐI NAY', l1: 'Việt Nam vs NZ:', l2: 'thắng là cầm vé?', score: 'DỰ ĐOÁN 2–1', figs: [{src: 'u17nz/duel.png', x: 140, h: 1150}]}} />
  <Still id="TH-BRUNO" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'LIVERPOOL 4–0 MU · ĐỘI TRƯỞNG NÓI', l1: '"Tôi rất', l2: 'tự hào."', score: 'ỦA? 🤨', figs: [{src: 'bruno/bruno_argue.png', x: 140, h: 1150}]}} />
  <Still id="TH-LIVMU" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'POCHETTINO RA MẮT MU', l1: 'Fan MU lại', l2: 'vào hang 🪨', score: 'LIV 4–0 MU', figs: [{src: 'livmu/caveman.png', x: 90, h: 1100}], logos: ['livmu/logo_liv.png', 'livmu/logo_mu.png']}} />
  <Still id="TH-U17S" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'U17 WORLD CUP · VIỆT NAM 2–3 BỈ', l1: 'Thua nhưng', l2: 'toàn siêu phẩm', figs: [{src: 'u17s/vn_knee.png', x: 120, h: 1050}]}} />
  <Composition id="BRUNO" component={BRUNOVideo} durationInFrames={Math.round(BRUNO_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="LIVMU" component={LIVMUVideo} durationInFrames={Math.round(LIVMU_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="CRVF" component={CRVFull} durationInFrames={CRVF_DUR} fps={30} width={1080} height={1920} />
  <Composition id="CRVM" component={CRVMotion} durationInFrames={CRVM_DUR} fps={30} width={1080} height={1920} />
  <Composition id="CRV" component={CRVVideo} durationInFrames={Math.round(CRV_DUR*30)} fps={30} width={1080} height={1920} />
  <Still id="TH-CRV" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'AL NASSR 2–1 AL SADD', l1: 'Bàn 988 bị huỷ', l2: 'vì… đồng đội', score: 'CÒN 13 BÀN TỚI 1000', figs: [{src: 'crv/cr_shock.png', x: 40, h: 1100}, {src: 'crv/angelo.png', x: 580, h: 1000}]}} />
  <Composition id="KUYT" component={KUYTVideo} durationInFrames={Math.round(KUYT_DUR*30)} fps={30} width={1080} height={1920} />
  <Still id="TH-KUYT" component={Thumb} width={1080} height={1920} defaultProps={{kicker: 'FENERBAHÇE 3–2 LIVERPOOL', l1: 'Hạ đội cũ,', l2: '1 tuần sau mất ghế', score: '2 TRẬN · 1 THẮNG', figs: [{src: 'kuyt/k_coach_fist.png', x: 40, h: 1100}, {src: 'kuyt/k_box.png', x: 560, h: 1050}]}} />
  <Composition id="U17R" component={U17RVideo} durationInFrames={Math.round(U17R_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="SIRALEX" component={SIRALEXVideo} durationInFrames={Math.round(SIRALEX_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="KVARA" component={KVARAVideo} durationInFrames={Math.round(KVARA_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="U17NZ" component={U17NZVideo} durationInFrames={Math.round(U17NZ_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="U17S" component={U17SVideo} durationInFrames={Math.round(U17S_DUR*30)} fps={30} width={1080} height={1920} />
  <Composition id="POD" component={PODVideo} durationInFrames={Math.round(POD_DUR*30)} fps={30} width={1080} height={1920} />
</>;
