from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

DICAS = {
    "algoritmos": "💡 Pense em algoritmo como uma receita de bolo. Tem ingredientes (entradas), passos ordenados (processamento) e um resultado (saída). Todo algoritmo deve ser finito e sem ambiguidade — cada passo tem significado único.",
    "variaveis": "💡 Variável é como uma caixa etiquetada na memória. Tem nome (etiqueta), tipo (formato da caixa) e valor (conteúdo). O tipo define o que pode ser armazenado: int para inteiros, float para decimais, string para texto, bool para verdadeiro/falso.",
    "entrada_saida": "💡 Siga o modelo IPO — Input, Process, Output. Em Python: input() sempre retorna string, então use int() ou float() para converter antes de calcular. print() exibe o resultado formatado.",
    "operadores": "💡 Três tipos: aritméticos (+, -, *, /, %) fazem cálculos. Relacionais (==, !=, >, <) comparam e retornam True/False. Lógicos (and, or, not) combinam condições booleanas. Atenção: == compara, = atribui!",
    "condicionais": "💡 Condicional é 'se isso, então aquilo'. O if verifica uma condição booleana. Se verdadeira, executa o bloco. O else executa quando falsa. elif adiciona condições extras. Sempre use == para comparar valores.",
    "repeticao": "💡 Use while quando não sabe quantas repetições (baseado em condição). Use for quando sabe quantas vezes ou percorre uma sequência. Todo loop precisa de uma condição de parada — sem ela é loop infinito!",
    "funcoes": "💡 Função é um bloco reutilizável com nome, parâmetros e retorno. Parâmetros são variáveis locais — só existem dentro da função. Use return para devolver um valor. Sem return, a função retorna None.",
    "vetores": "💡 Lista em Python é uma sequência indexada a partir de 0. lista[0] é o primeiro, lista[-1] é o último. len(lista) retorna o tamanho. Para percorrer use for item in lista. Matrizes são listas de listas.",
}

EXPLICACOES = {
    "algoritmos": "Algoritmo é uma sequência finita de passos bem definidos para resolver um problema. Características essenciais: deve ter começo e fim, cada passo deve ser não-ambíguo, e deve funcionar para qualquer entrada válida.",
    "variaveis": "Variáveis armazenam dados na memória durante a execução. Em Python você não declara o tipo — ele é inferido automaticamente. nome = 'João' cria uma string, idade = 20 cria um int, altura = 1.75 cria um float.",
    "entrada_saida": "Entrada é receber dados do usuário (input()). Processamento é manipular esses dados. Saída é apresentar o resultado (print()). O modelo IPO (Input-Process-Output) guia a estrutura de qualquer programa.",
    "operadores": "Operadores são símbolos que realizam operações. O mais confundido é == (comparação) vs = (atribuição). if x = 5 é erro de sintaxe; if x == 5 verifica se x vale 5. Operadores lógicos: and exige os dois verdadeiros, or exige pelo menos um.",
    "condicionais": "O if avalia uma expressão que resulta em True ou False. Blocos são definidos por indentação (4 espaços). if → bloco obrigatório; elif → bloco opcional repetível; else → bloco opcional final que captura tudo que não entrou antes.",
    "repeticao": "while repete enquanto a condição for verdadeira — cuidado com loop infinito se a condição nunca mudar. for percorre itens de uma sequência (lista, range, string). range(5) gera 0,1,2,3,4. break sai do loop, continue pula para a próxima iteração.",
    "funcoes": "Funções evitam repetição de código. def nome(param1, param2): define a função. Ao chamar: resultado = nome(valor1, valor2). Escopo: variáveis dentro da função não existem fora. Use return para devolver dados ao chamador.",
    "vetores": "Listas em Python são dinâmicas (crescem e diminuem). Criação: numeros = [1, 2, 3]. Acesso: numeros[0]. Adição: numeros.append(4). Remoção: numeros.remove(2) ou numeros.pop(0). Percurso: for n in numeros ou for i in range(len(numeros)).",
}

GENERICA_DICA = "💡 Dica geral: leia a questão com calma e identifique o que está sendo pedido. Elimine as alternativas obviamente erradas primeiro. Se ainda não sabe, o sistema vai reapresentar a questão para reforçar!"
GENERICA_EXPLICACAO = "Pode me dizer qual conceito específico está confuso? Posso explicar melhor se souber qual parte não ficou clara."


class ActionSetTopic(Action):
    def name(self) -> Text:
        return "action_set_topic"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual") or next(tracker.get_latest_entity_values("topico"), None)
        if topico:
            dispatcher.utter_message(text=f"Entendido! Estou aqui para te ajudar com **{topico.replace('_', ' ').title()}**. Pode perguntar à vontade!")
            return [SlotSet("topico_atual", topico)]
        dispatcher.utter_message(text="Olá! Estou aqui para te ajudar. Pode pedir dicas ou tirar dúvidas sobre qualquer questão!")
        return []


class ActionGiveHint(Action):
    def name(self) -> Text:
        return "action_give_hint"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual")
        dica = DICAS.get(topico, GENERICA_DICA) if topico else GENERICA_DICA
        dispatcher.utter_message(text=dica)
        return []


class ActionExplain(Action):
    def name(self) -> Text:
        return "action_explain"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual")
        explicacao = EXPLICACOES.get(topico, GENERICA_EXPLICACAO) if topico else GENERICA_EXPLICACAO
        dispatcher.utter_message(text=explicacao)
        return []
