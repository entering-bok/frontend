import React from "react";

function DialogueBox({ dialogues, onNext }) {
  // assistant 메시지만 필터링
  const assistantMessages = dialogues.filter((dialogue) => dialogue.role === "assistant");

  return (
    <div className="dialogue-box">
      {/* assistant 메시지가 있을 경우 출력 */}
      {assistantMessages.length > 0 ? (
        assistantMessages.map((dialogue, index) => (
          <div key={index} className="dialogue-message">
            {dialogue.content}
          </div>
        ))
      ) : (
        <p>No dialogue yet.</p> // 초기 메시지
      )}

      {/* 항상 버튼 표시 */}
      <button onClick={onNext}>다음 대화 진행</button>
    </div>
  );
}

export default DialogueBox;