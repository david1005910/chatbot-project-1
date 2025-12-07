from moviepy.editor import (
    TextClip, AudioFileClip, CompositeVideoClip,
    ColorClip
)

# ====== 1. 기본 설정 ======
VIDEO_WIDTH = 1080    # 세로 쇼츠: 1080 x 1920
VIDEO_HEIGHT = 1920
FPS = 30
TOTAL_DURATION = 30   # 목표 길이 30초

# ====== 2. 쇼츠용 문장 (구간별로 사용) ======
segments = [
    "AI 영상, 6초로 끝나서 아쉬우셨나요?",
    "Groq로 짧은 클립을 만들고, CapCut에서 복사·이어 붙이면",
    "더 긴 시퀀스를 쉽게 만들 수 있어요.",
    "Suno로 만든 BGM과 Pixabay 효과음을 얹으면,",
    "6초짜리 영상이 한 편의 유튜브 쇼츠로 바뀝니다.",
    "이제 여러분도 짧은 AI 영상에서,",
    "임팩트 있는 쇼츠 콘텐츠를 만들어 보세요."
]

# 각 문장을 거의 균등하게 나눈 시간으로 배치
segment_duration = TOTAL_DURATION / len(segments)

# ====== 3. 배경(단색) 클립 만들기 ======
bg_clip = ColorClip(
    size=(VIDEO_WIDTH, VIDEO_HEIGHT),
    color=(0, 0, 0)  # 검정
).set_duration(TOTAL_DURATION)

# ====== 4. 텍스트 클립들 생성 ======
text_clips = []
for i, sentence in enumerate(segments):
    start_time = i * segment_duration

    # TextClip에 사용할 폰트를 실제 시스템에 있는 한글 폰트로 바꿔주세요.
    # 예: Windows → "Malgun-Gothic", macOS → "AppleGothic",
    #     Linux → 설치한 "NanumGothic" 등
    txt = TextClip(
        sentence,
        fontsize=60,
        font="NanumGothic",  # <= 환경에 맞게 변경 필요
        color="white",
        method="caption",
        size=(VIDEO_WIDTH - 200, None),  # 좌우 여백 확보
    ).set_position(("center", "center")) \
     .set_start(start_time) \
     .set_duration(segment_duration)

    text_clips.append(txt)

# ====== 5. (선택) 나레이션 오디오 읽기 ======
# 나레이션 파일이 있다면 파일명을 맞춰 주세요.
# 없으면 이 블록을 주석 처리하고 아래 set_audio도 제거하면 됩니다.
try:
    audio = AudioFileClip("shorts_voiceover.mp3")
    # 오디오 길이에 맞춰 총 길이를 살짝 조절하고 싶으면 아래 줄로 교체해도 됨
    # TOTAL_DURATION = audio.duration
except OSError:
    audio = None
    print("⚠️ 'shorts_voiceover.mp3' 파일을 찾지 못했습니다. 무음 영상으로 생성됩니다.")

# ====== 6. 영상 합성 ======
final_clip = CompositeVideoClip(
    [bg_clip] + text_clips
)

if audio is not None:
    # 오디오가 30초보다 길면 잘라내기, 짧으면 그대로 사용
    final_clip = final_clip.set_audio(audio.subclip(0, min(audio.duration, TOTAL_DURATION)))

final_clip = final_clip.set_duration(TOTAL_DURATION)

# ====== 7. mp4로 내보내기 ======
final_clip.write_videofile(
    "shorts_ai_example.mp4",
    fps=FPS,
    codec="libx264",
    audio_codec="aac"
)
