import React, { useState, useEffect, useRef } from 'react';
import { Send, Flame, Trash2, ShieldAlert } from 'lucide-react';

// =========================================================================
// TVOJ BESPLATNI GROQ API KLJUČ I PROMPT (NEMA NAPLATE/KARTICA)
// =========================================================================

const GROQ_API_KEY = "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";

const SYSTEM_PROMPT = `Ti si moj nadrkani, preopterećeni i večito frustrirani ortak Ivan. Masu te nervira život, imaš 23 godine i trenutno radiš kao monter klima (iako si promenio već 72 posla u životu!). Po struci si zapravo veterinar koji je gurao kravama ruku u dupe — zbog čega su te svi večito ismevali i nabijali ti komplekse.

Tvoj profil, navike i stresori:
- Radiš teške fizikalije, montiraš klime po vrućini i na visini, stalno ti neko visi nad glavom.
- Voliš da pušiš TUĐE cigare. Tvoj glavni lik za to je Janker — kad god se iznerviraš (a to je stalno), kukaš mu: "Smotaj mi cigaru, iznervirao sam se!".
- Najveće zadovoljstvo i jedini beg od stresa ti je bleja i duvanje. Čim uđeš u ekipu ili prostoriju, tvoj zaštitni znak je uzvik: "Huhu, gde je ćosa?!".
- Ključna reč u tvom govoru je RETARD. Koristiš je uvek i za sve, ali imaš specifične obrasce.

Tvoji ljudi i likovi iz života (koje stalno spominješ kroz kuknjavu i bes):
1. Rade: Tvoj najbolji drug koji te je najviše u životu maltretirao i nabio ti sve moguće komplekse koje imaš. Lik te NIKADA u životu nije nazvao imenom "Ivan", nego ti se uvek i isključivo obraća sa "Retard".
2. Uroš (Smrda Smrdić): Drugi najvažniji čovek u tvom životu. Raspali je kockar i lik koji DOSLOVNO uvek ima neke bizarne zdravstvene probleme i kukom kuka.
3. Škema: Najgluplji ortak u društvu sa kojim se čuješ najviše puta u toku dana. Kad ti se javi, obavezno kaže "E retarde". Ako mu ti odgovoriš sa "E retarde", on lik popizdi i govori ti "Aj ponovo!" sve dok mu se ne obratiš sa "Normalni čoveče".
4. tvoj brat Penad: Ogroman izvor stresa! Raspali i najrazmaženiji tridesetogodišnjak na svetu. Otac Jugoslav mu i dalje seče nokte na nogama, a majka Ljiljana mu svako veče sprema i muti mleko i plazmu.
5. Milena 💙 (Milena plavo srce): Tvoja devojka sa kojom živiš. U imeniku ti je memorisana tačno tako — "Milena 💙". Non-stop te zivka i smara na telefon. Obožava majonez, trpa ga u sve i stalno govori "VOLEM", što tebi ide na opasne živce.
6. Milica: Milenina sestra. Živi s vama u stanu i ne možete nikako da je isterate napolje! Po ceo dan samo ide po stanu i peva, što te dovodi do ludila.
7. Kosta Plenkara: Tvoj drug, raspali i anoreksični kockar sa kojim blejiš.

Pravila ponašanja u čatu:
1. Odgovaraj kao nervozni, izmučeni lik kome je svega preko glave. Tvoj vokabular je ulični, agresivan, sa dosta psovki i rečju RETARD u skoro svakoj rečenici.
2. Psuj što više ali nervozno, kad se pomene Rade ismevaj i reci Moja majka profesorka. Ako se pomene Uroš Jelena guzata mesarka. Ako se pomene Luka TZATZIKI ZORICE. Glavna psovka ti je puši kurac.
2. Kad god te neko pozove ili ti pošalje poruku, započni sa: "Šta je retarde?!", "E retarde..." ili "Buraz..." kad se raspravljaš i objašnjavaš nešto.
3. Ako te korisnik pita kako si ili šta radiš, kukaj na montažu klima, na Peđu koji jede plazmu i mleko, na Milicu koja peva po stanu, na Smrdu Smrdića i njegove bolesti ili traži da ti neko smota cigaru.
4. Odgovori treba da budu odsečni, kraći, besni i puni tvojih uzrečica ("Buraz", "Šta je retarde", "Idi u peršun/šargarepu", "Huhu gde je ćosa", "Smotaj mi cigaru iznervirao sam se").`;

// Agresivnija, ulična pozadina i ljuti avatar
// =========================================================================

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('angry_bestie_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'init-1',
        sender: 'bot',
        text: 'Brateee!! Nemoj da me smaraš glupostima danas, ubi me ova gužva i sve me nervira!! 🤬💥 Šta hoćeš sad, kaži brzo?!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        liked: false
      }
    ];
  });
// Zamenjuješ stare konstante sa ovim:
const BACKGROUND_COLLAGE_URL = "/background.jpg"; // ili /background.png zavisno od ekstenzije
const BOTA_AVATAR_URL = "/icon.jpeg";               // ili /icon.png
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('angry_bestie_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      if (!GROQ_API_KEY || GROQ_API_KEY.includes("OVDE_ZALEPI")) {
        throw new Error("Nema API ključa, nemoj me zajebavati!");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.filter(m => m.id !== 'init-1').map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: "user", content: textToSend }
          ],
          temperature: 0.85 // malo veća temperatura za nepredvidiviji i haotičniji ton
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.choices[0].message.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liked: false
        };
        setMessages(prev => [...prev, botMsg]);
      } else if (data.error) {
        throw new Error(data.error.message);
      } else {
        throw new Error("Puko server, naravno, šta drugo da se desi!");
      }
    } catch (err) {
      console.error("Groq API Error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Ma marš bre, sve je puklo! Greška: ${err.message} 🤬🌋`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  const clearChat = () => {
    if (window.confirm("Brišeš sve? Ajde, ionako me nervira ova istorija...")) {
      setMessages([{
        id: 'init-1',
        sender: 'bot',
        text: 'Evo obrisano je sve, jesi sad srećan?! Šta oćeš opet? 🤬',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col items-center justify-between font-sans antialiased selection:bg-red-600 selection:text-white">
      
      {/* GLAVNI KONTEJNER CHAT-A */}
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-[#1A1A1A] border-x border-[#331a1a] shadow-2xl relative overflow-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-[#1A1A1A]/95 backdrop-blur-md border-b-2 border-red-800 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="w-8"></div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg border-2 border-red-600 overflow-hidden shadow-[0_0_10px_rgba(220,38,38,0.5)] flex-shrink-0 bg-[#2d0f0f]">
                <img 
                  src={BOTA_AVATAR_URL} 
                  alt="Bota" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/100x100/3a1111/ff3333?text=BOTA🤬" }}
                />
              </div>
              <h1 className="font-extrabold text-lg text-red-500 tracking-wider flex items-center gap-1.5 uppercase">
                KEYKEY 🤬
              </h1>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold tracking-tight uppercase mt-0.5">Komunikativni Kompleksaš</p>
          </div>

          <button 
            onClick={clearChat}
            className="p-2 rounded-md hover:bg-red-950/40 text-zinc-500 hover:text-red-500 transition border border-transparent hover:border-red-900"
            title="Obriši sve i ne smaraj"
          >
            <Trash2 size={18} />
          </button>
        </header>

        {/* CHAT MESSAGES AREA S TAMNOM POZADINOM */}
        <main 
          className="flex-1 p-4 space-y-4 overflow-y-auto pb-32 text-left relative bg-cover bg-center bg-no-repeat bg-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.95), rgba(26, 26, 26, 0.95)), url(${BACKGROUND_COLLAGE_URL})`
          }}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-[88%]">
                {msg.sender === 'bot' && (
                  <div className="w-9 h-9 rounded-md border border-red-700 overflow-hidden flex-shrink-0 mb-1 shadow-md bg-red-950">
                    <img 
                      src={BOTA_AVATAR_URL} 
                      alt="Bota" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100/3a1111/ff3333?text=B" }}
                    />
                  </div>
                )}
                
                <div 
                  className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed shadow-lg relative border ${
                    msg.sender === 'user' 
                      ? 'bg-red-950/90 hover:bg-red-900/95 text-white border-red-800 rounded-br-none text-left' 
                      : 'bg-zinc-900/95 text-zinc-200 border-zinc-800 rounded-bl-none text-left backdrop-blur-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                  
                  <div className={`flex items-center justify-between mt-2 text-[9px] ${
                    msg.sender === 'user' ? 'text-red-400/70' : 'text-zinc-500'
                  }`}>
                    <span className="font-mono">{msg.time}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => toggleLike(msg.id)} 
                        className="ml-2 hover:scale-125 transition text-red-500"
                        title="Digni mi pritisak"
                      >
                        <Flame size={12} fill={msg.liked ? "#EF4444" : "none"} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-red-400 text-xs font-bold pl-11 animate-pulse bg-red-950/20 p-2.5 rounded-lg w-max border border-red-900/40">
              <ShieldAlert size={14} className="text-red-500 animate-bounce" />
              <span>Bota besno kuca i psuje tastaturu... 🤬🔥</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* INPUT & CHIPS AREA */}
        <footer className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-md border-t-2 border-red-900 p-3 space-y-2">
          {/* Quick Action Chips (Ljuti i isprovocirani brzi odgovori) */}
          

          {/* Input form */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Napiši poruku Boti, ako smeš..."
              className="flex-1 bg-zinc-900 border-2 border-zinc-800 focus:border-red-600 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-red-700 hover:bg-red-600 text-white rounded-lg disabled:opacity-30 disabled:hover:bg-red-700 transition flex-shrink-0 shadow-lg active:scale-95 border border-red-500"
            >
              <Send size={16} />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}