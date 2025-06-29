import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native'; // NOVO: TouchableOpacity, KeyboardAvoidingView, Platform
import { getTaskById, addTask, updateTask } from '../database/database';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types/Task.type';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
    TaskList: undefined;
    TaskForm: { taskId?: number } | undefined;
    TaskDetail: { taskId: number };
};

type TaskFormScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

/**
 * Tela de formulário para criação e edição de tarefas.
 *
 * Esta tela permite ao usuário criar uma nova tarefa ou editar uma tarefa existente.
 * Ao editar, os campos são preenchidos automaticamente com os dados da tarefa selecionada.
 * O usuário pode informar o título, descrição e, ao editar, alterar o status da tarefa.
 *
 * Funcionalidades:
 * - Criação de nova tarefa.
 * - Edição de tarefa existente (com carregamento dos dados).
 * - Validação do campo de título (não pode ser vazio, diferente do campo de descrição, que é opcional).
 * - Exibição de loading ao carregar ou salvar dados.
 * - Alteração do status da tarefa apenas no modo de edição.
 * - Botões para cancelar ou salvar/atualizar a tarefa.
 *
 * @param {TaskFormScreenProps} props Propriedades de navegação e rota, incluindo o possível `taskId` para edição.
 * @returns {JSX.Element} Componente de formulário de tarefa.
 */
export default function TaskFormScreen({ route, navigation }: TaskFormScreenProps) {
    const taskId = route.params?.taskId;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'completed'>('pending');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (taskId) {
            const loadTask = async () => {
                setLoading(true);
                try {
                    const task = await getTaskById(taskId) as Task;
                    if (task) {
                        setTitle(task.title);
                        setDescription(task.description || '');
                        setStatus(task.status as 'pending' | 'completed');
                    } else {
                        Alert.alert('Erro', 'Tarefa não encontrada.');
                        navigation.goBack();
                    }
                } catch (error) {
                    console.error('Erro ao carregar tarefa:', error);
                    Alert.alert('Erro', 'Não foi possível carregar a tarefa.');
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            };
            loadTask();
        }
    }, [taskId, navigation]);

    const handleSaveTask = useCallback(async () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'O título da tarefa não pode estar vazio.');
            return;
        }

        setLoading(true);
        try {
            if (taskId) {
                await updateTask(taskId, title, description, status);
                Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
            } else {
                await addTask(title, description);
                Alert.alert('Sucesso', 'Tarefa adicionada com sucesso!');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
        } finally {
            setLoading(false);
        }
    }, [taskId, title, description, status, navigation]);

    if (loading && taskId) { // Apenas mostra loading se estiver editando e carregando
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando tarefa...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView // Permite que o teclado não cubra os inputs
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Título:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Título da Tarefa"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    <Text style={styles.label}>Descrição:</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detalhes da Tarefa (opcional)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                    />

                    {taskId && ( // Mostrar status apenas ao editar
                        <View style={styles.statusContainer}>
                            <Text style={styles.label}>Status:</Text>
                            <TouchableOpacity
                                style={[styles.statusButton, status === 'pending' && styles.statusButtonActive]}
                                onPress={() => setStatus('pending')}
                            >
                                <Text style={[styles.statusButtonText, status === 'pending' && styles.statusButtonTextActive]}>
                                    Pendente
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, status === 'completed' && styles.statusButtonActive]}
                                onPress={() => setStatus('completed')}
                            >
                                <Text style={[styles.statusButtonText, status === 'completed' && styles.statusButtonTextActive]}>
                                    Concluída
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="cancel" size={24} color="#6200ee" />
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={handleSaveTask}
                            disabled={loading}
                        >
                            <MaterialIcons name="save" size={24} color="#fff" />
                            <Text style={styles.saveButtonText}>{taskId ? 'Atualizar' : 'Salvar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6200ee',
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    statusButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#957DAD',
        backgroundColor: '#fff',
    },
    statusButtonActive: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    statusButtonText: {
        fontSize: 14,
        color: '#6200ee',
        fontWeight: 'bold',
    },
    statusButtonTextActive: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        gap: 8,
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#6200ee',
        marginLeft: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderColor: '#6200ee',
        borderWidth: 1,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#6200ee',
        fontSize: 16,
        fontWeight: 'bold',
    },
});