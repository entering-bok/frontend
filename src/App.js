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
  const [userInput, setUserInput] = useState(""); // 사용자 입력
  const [selectedGPT, setSelectedGPT] = useState(null); // 사용자와 대화할 GPT
  const [conversationType, setConversationType] = useState(null); // 대화 유형 ("two-gpts" or "user-gpt")

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

  // 사용자와 대화할 GPT 선택
  const handleSingleGPTSelect = (character) => {
    setSelectedGPT(character);
  };

  // 두 GPT 간 대화 시작 요청
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
      setConversationType("two-gpts"); // 대화 유형 설정
      console.log("Two GPTs conversation started with ID:", data.conversationId);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 사용자와 GPT 간 대화 시작 요청
  const startSingleConversation = async () => {
    if (!selectedGPT) {
      setError("대화할 GPT를 선택해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/startSingleConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gptId: selectedGPT.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setDialogues([]); // 기존 대화 초기화
      setConversationType("user-gpt"); // 대화 유형 설정
      console.log("Single GPT conversation started with ID:", data.conversationId);
    } catch (error) {
      console.error("Error starting single conversation:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 대화 계속 요청
  const continueConversation = async (userMessage, speakerId) => {
    if (!conversationId) {
      setError("대화가 시작되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // `two-gpts`와 `user-gpt` 대화 유형에 따라 다른 API 호출
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
      setDialogues(data.messages); // 대화 업데이트
      setTurn((prev) => prev + 1); // 턴 증가
    } catch (error) {
      console.error("Error continuing conversation:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 입력 기반 대화 요청
  const handleUserInputSubmit = async () => {
    if (conversationType !== "user-gpt") {
      setError("사용자와 GPT 간 대화를 시작해야 합니다.");
      return;
    }

    if (!userInput.trim()) {
      setError("입력 내용이 비어 있습니다.");
      return;
    }

    await continueConversation(userInput, selectedGPT.id);
    setUserInput(""); // 입력 초기화
  };

  // 두 GPT 간 대화 진행 요청
  const handleDialogueClick = async () => {
    if (conversationType !== "two-gpts") {
      setError("두 GPT 간 대화를 시작해야 합니다.");
      return;
    }

    const userMessage = null;

    const speakerId = turn % 2 === 0 ? selectedCharacters[0].id : selectedCharacters[1].id;

    await continueConversation(userMessage, speakerId);
  };

  return (
    <div className="app">
      <div className="control-panel">
        <h2>두 GPT 간 대화</h2>
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
      <div className="user-interaction">
        <h2>사용자와 GPT 대화</h2>
        <div className="characters">
          {characters.map((character) => (
            <Character
              key={character.id}
              name={character.name}
              role={character.role}
              onClick={() => handleSingleGPTSelect(character)}
              selected={selectedGPT?.id === character.id}
            />
          ))}
        </div>
        <button onClick={startSingleConversation}>Start GPT Conversation</button>
        <div className="user-input">
          <textarea
            placeholder="여기에 메시지를 입력하세요..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button onClick={handleUserInputSubmit}>Send</button>
        </div>
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