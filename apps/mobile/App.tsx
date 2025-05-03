import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, NativeModules, Button, TextInput } from 'react-native';

const { Greeting } = NativeModules;

export default function App() {
  const [name, setName] = useState('Mundo');
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState('');

  const fetchGreeting = async () => {
    setError('');
    setGreeting('Carregando saudação...');
    try {
      const result = await Greeting.getGreeting(name);
      setGreeting(result);
    } catch (e: any) {
      console.error("Erro ao chamar o módulo nativo:", e);
      setError(`Erro: ${e.message}`);
      setGreeting('');
    }
  };

  useEffect(() => {
    if (Greeting) {
      fetchGreeting();
    } else {
      setError("Módulo nativo 'Greeting' não encontrado. Verifique a compilação e o plugin.");
    }
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste Módulo Nativo Android</Text>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Digite seu nome"
      />
      <Button title="Obter Saudação Nativa" onPress={fetchGreeting} disabled={!Greeting} />
      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!Greeting && <Text style={styles.error}>Módulo Nativo Greeting não carregado!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '80%',
  },
  greeting: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
  },
  error: {
    marginTop: 15,
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
