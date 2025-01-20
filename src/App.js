import React, { useState } from "react";
import Character from "./components/Character";
import DialogueBox from "./components/DialogueBox";
import "./styles/App.css";

function App() {
  const [dialogues, setDialogues] = useState([]);
  const [turn, setTurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  const characters = [
    { id: "grandma", name: "할머니", role: "덕담과 잔소리" },
    { id: "student", name: "학생", role: "대답과 반박" },
    { id: "grandfa", name: "할아버지", role: "덕담과 잔소리" },
  ];

  // 캐릭터 선택
  const handleCharacterSelect = (character) => {
    if (selectedCharacters.length < 2 && !selectedCharacters.includes(character)) {
      setSelectedCharacters((prev) => [...prev, character]);
    }
  };

  // 대화 시작 요청
  const startConversation = async () => {
    if (selectedCharacters.length !== 2) {
      setError("두 캐릭터를 선택해야 대화를 시작할 수 있습니다.");
      return;
    }

    const [gpt1, gpt2] = selectedCharacters;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/startConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gpt1Id: gpt1.id, gpt2Id: gpt2.id }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setDialogues([]); // 기존 대화 초기화
      setTurn(0);
      console.log("Conversation started with ID:", data.conversationId);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 대화 계속 요청
  const continueConversation = async (userMessage, speakerId) => {
    if (!conversationId) {
      setError("No active conversation. Please start a conversation first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/continueConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          userMessage,
          speakerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // assistant 메시지만 필터링하여 대화 업데이트
      const filteredMessages = data.messages.filter((message) => message.role === "assistant");
      setDialogues(filteredMessages);
    } catch (error) {
      console.error("Error continuing conversation:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 캐릭터 클릭 시 대화 요청
  const handleDialogueClick = async () => {
    if (turn >= 5) {
      setError("대화가 종료되었습니다. 새로운 대화를 시작하세요.");
      return;
    }

    const userMessage =
      turn % 2 === 0
        ? `${selectedCharacters[0].name}의 역할에 맞는 대답을 해주세요.`
        : `${selectedCharacters[1].name}의 역할에 맞는 대답을 해주세요.`;

    const speakerId = turn % 2 === 0 ? selectedCharacters[0].id : selectedCharacters[1].id;

    await continueConversation(userMessage, speakerId);
    setTurn((prev) => prev + 1);
  };

  return (
    <div className="app">
      <div className="control-panel">
        <h2>캐릭터를 선택하세요</h2>
        <div className="characters">
          {characters.map((character) => (
            <Character
              key={character.id}
              name={character.name}
              role={character.role}
              onClick={() => handleCharacterSelect(character)}
              selected={selectedCharacters.includes(character)} // 선택 여부 표시
            />
          ))}
        </div>
        {selectedCharacters.length === 2 && (
          <button onClick={startConversation}>Start Conversation</button>
        )}
      </div>
      <div className="dialogue-area">
        {loading && <p>Loading dialogue...</p>}
        {error && <p className="error">{error}</p>}
        <DialogueBox dialogues={dialogues} onNext={handleDialogueClick} />
      </div>
    </div>
  );
}

export default App;