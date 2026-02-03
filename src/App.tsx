import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

//tipagem ts

interface Materia {
  id: number,
  nome: string,
  metaHoras: number,
  qtdHorasEstudadas: number
}

// Formata o tempo do cronometro em hrs, min e seg

const formatarTempo = (totalSegundos: number) => {
    const hrs = Math.floor(totalSegundos / 3600)
    const min = Math.floor((totalSegundos % 3600) / 60)
    const seg = totalSegundos % 60
    return `${hrs.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
  };

// Lista das matérias e cronometro

function MateriaItem({materia, atualizarTempoMateria}) {
    const [segundos, setSegundos] = useState(0)
    const [rodando, setRodando] = useState(false)

    const finalizarSessao = () => {
      atualizarTempoMateria(materia.id, segundos)
      setSegundos(0)
      setRodando(false)
      alert("Progresso salvo com sucesso!")
    };

    useEffect(() => {
      let intervalo: any
      if (rodando) {
        intervalo = setInterval(() => setSegundos(s => s + 1), 1000)
      }
      return () => clearInterval(intervalo)
  }, [rodando])

  const metaAtingida = (materia.qtdHorasEstudadas + (segundos / 3600)) >= materia.metaHoras

  return (
    <li className="materia">
      <p className="descricao-item"> <b className="negrito">Matéria:</b> <span className={metaAtingida ? "materia-concluida" : ""}>{materia.nome}</span></p>
        
      <div className="display-tempo">{formatarTempo(segundos)}</div>

      <div className="controles">
        <button className="bt-controle" onClick={() => setRodando(!rodando)}>{rodando ? "⏸️" : "▶️"}</button>

        <button className='bt-salvar-horas' onClick={finalizarSessao}>💾</button>
          
      </div>
    </li>
  )}




function App() {

  const [materias, setMaterias] = useState<Materia[]>(() => {
    const salvar = localStorage.getItem('lista_estudos')

    return salvar ? JSON.parse(salvar) : []
  })

  useEffect(() => {
    localStorage.setItem('lista_estudos', JSON.stringify(materias))
  }, [materias])

  const atualizarTempoMateria = (id: number, segundosEstudados: number) => {
    const horasParaAdicionar = segundosEstudados / 3600;
    setMaterias(materias.map(m => 
      m.id === id ? { ...m, qtdHorasEstudadas: m.qtdHorasEstudadas + horasParaAdicionar } : m
    ))
  }
  
  const [nomeInput, setNomeInput] = useState('')
  const [metaInput, setMetaInput] = useState<number>(0)

  const [abaEscolhida, setAbaEscolhida] = useState('lista')

  const [versaoLista, setVersaoLista] = useState(0);

  // Cria um array das materias adicionadas 

  const adicionarMateria = () => {
    if (nomeInput === '' || metaInput <= 0) return

    const novaMateria: Materia = {
      id: Date.now(),
      nome: nomeInput,
      metaHoras: metaInput,
      qtdHorasEstudadas: 0
    }

    setMaterias([...materias, novaMateria])
    
    setNomeInput('')
    setMetaInput(0)
  }

  // Remove a materia

  const removerMateria = (id: number) => {
    setMaterias(materias.filter(materia => materia.id !== id))
  }

  // Reseta o tempo de todas as materias, criado para resetar semanalmente

  const resetarTudo = () => {
   if (window.confirm("Quer resetar tudo?")) {
    const listaResetada = materias.map(m => ({ ...m, qtdHorasEstudadas: 0 }));
    setMaterias(listaResetada);

    setVersaoLista(prev => prev + 1);
  }
};


  return (

      <div className="main">
        
        <h1 className='titulo-principal'>Cronometro de Estudos</h1>

        <div className='container'>
          <nav className='navbar'>
            <button className='bt-navbar'onClick={() => setAbaEscolhida ('adicionarMateria')}>Adicionar Matéria</button>
            <button className='bt-navbar'onClick={() => setAbaEscolhida ('HorasMateria')}>Horas Matérias</button>
          </nav>
        
          {abaEscolhida === 'adicionarMateria' && (

          <div className='card-add-materia'>

            <div className='form-adicionar-materia'>
              <div className='inputs'>
                <input className='input-nome-materia' type="text" placeholder="Nome da matéria" value={nomeInput} onChange={(e) => setNomeInput(e.target.value)}/>
                <input className='input-horas' type="number" step="0.01" placeholder="Meta de horas" value={metaInput} onChange={(e) => setMetaInput(Number(e.target.value))}/>
                <button className='bt-add' onClick={adicionarMateria}>Add</button>
              </div>
            </div>

            <h2 className='titulo-lista-materias'>Matérias Adicionadas</h2>

            {materias.length === 0 ? (
              <p className="lista-vazia">A lista está vazia! </p>
            ) : (
              <ul className="lista-materias-adicionadas">
                {materias.map(materia => (
                  <li key={materia.id} className="materia">
                    <p className='descricao-item'><b className='negrito'>Matéria:</b> {materia.nome}<b className='negrito'> Meta:</b> {materia.metaHoras}h</p>
                    <button onClick={() => removerMateria(materia.id)} className="btn-apagar" title="Apagar matéria">🗑️</button>
                  </li>    
                ))}
              </ul>
            )}
            
          </div>
          )}

          {abaEscolhida === 'HorasMateria' && (

          <div className='card-controle-horas'>

            {materias.length === 0 ? (<p className="lista-vazia">A lista está vazia! </p>
            ) : (

              <ul className="lista-materias-adicionadas">
              {materias.map(materia => (
                <MateriaItem 
                  key={`${materia.id}-${versaoLista}`} 
                  materia={materia}
                  atualizarTempoMateria={atualizarTempoMateria}
                />
              ))}

              <button className='bt-resetar-td' onClick={resetarTudo}>Resetar Horas</button>
            </ul>
            )}

          </div>
          )}

        </div>
      </div>
  )
}

export default App
