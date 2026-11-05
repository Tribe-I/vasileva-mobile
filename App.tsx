import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';

type Brief = { problem: string; audience: string; value: string; solution: string; metric: string; constraints: string };
const empty: Brief = { problem: '', audience: '', value: '', solution: '', metric: '', constraints: '' };
const example: Brief = {
  problem: 'Новые пользователи не всегда понимают, какую сумму выбрать при пополнении',
  audience: 'Новые пользователи финансового сервиса',
  value: 'Увеличить число успешных пополнений',
  solution: 'Проверить подсказки сумм в сценарии пополнения',
  metric: 'Конверсия в успешное пополнение; дополнительные метрики определить с аналитиком',
  constraints: 'Уточнить сегмент, базовые показатели и критерии успеха перед экспериментом',
};
const fields: { key: keyof Brief; label: string; placeholder: string }[] = [
  { key: 'problem', label: 'Проблема', placeholder: 'Что мешает пользователю или бизнесу?' },
  { key: 'audience', label: 'Аудитория', placeholder: 'Для кого решаем задачу?' },
  { key: 'value', label: 'Бизнес-ценность', placeholder: 'Какого результата хотим добиться?' },
  { key: 'solution', label: 'Гипотеза решения', placeholder: 'Что предлагаем проверить?' },
  { key: 'metric', label: 'Метрики успеха', placeholder: 'По каким показателям поймём, что получилось?' },
  { key: 'constraints', label: 'Ограничения и вопросы', placeholder: 'Что нужно уточнить перед запуском?' },
];
const commit = process.env.EXPO_PUBLIC_COMMIT?.trim().slice(0, 7) || 'dev';

export default function App() {
  const [screen, setScreen] = useState<'main' | 'about'>('main');
  const [idea, setIdea] = useState('');
  const [brief, setBrief] = useState<Brief>(empty);
  const [demo, setDemo] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  function showExample() {
    const fill = () => {
      setIdea('Хотим увеличить долю успешных пополнений: пользователям не всегда понятно, какую сумму выбрать');
      setBrief(example); setDemo(true); setError(false); setMessage('Пример загружен. Все поля можно изменить');
    };
    if (idea.trim() || Object.values(brief).some((value) => value.trim())) {
      Alert.alert('Заменить текущий текст примером?', 'Сохрани бриф, если хочешь вернуться к нему позже', [
        { text: 'Отмена', style: 'cancel' }, { text: 'Заменить', onPress: fill },
      ]);
    } else fill();
  }
  function research() {
    if (!idea.trim()) { setError(true); setMessage('Сначала опиши идею или бизнес-задачу'); return; }
    setError(false); setMessage('AI-поиск пока не подключён. Можно заполнить бриф вручную или посмотреть пример');
  }
  async function saveBrief() {
    try {
      const text = ['РАБОЧИЙ БРИФ', ...fields.map(({ key, label }) => `\n${label}\n${brief[key].trim() || 'Не указано'}`)].join('\n');
      const file = new File(Paths.cache, 'product-brief.txt');
      file.write(text);
      if (!(await Sharing.isAvailableAsync())) { setMessage('Сохранение файла на этом устройстве недоступно'); return; }
      await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Сохранить или отправить бриф', UTI: 'public.plain-text' });
    } catch { setMessage('Не удалось подготовить файл. Попробуй ещё раз'); }
  }
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <View style={s.topbar}>
        <Text style={s.brand}>product notebook</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={screen === 'main' ? 'О приложении' : 'Вернуться к брифу'} onPress={() => setScreen(screen === 'main' ? 'about' : 'main')} style={s.nav}>
          <Text style={s.navText}>{screen === 'main' ? 'О приложении' : 'К брифу'}</Text>
        </Pressable>
      </View>
      {screen === 'about' ? (
        <View style={s.about}>
          <Text accessibilityRole="header" style={s.title}>О приложении</Text>
          <Text style={s.body}>От идеи к брифу — помощник для подготовки продуктовых задач и обсуждения их с командой</Text>
          <Text style={s.muted}>Версия сборки</Text><Text selectable style={s.version}>{commit}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={s.grow} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={s.title}>От идеи к брифу</Text>
            <Text style={s.lead}>Опиши задачу своими словами и собери основу для работы с командой</Text>
            <Pressable accessibilityRole="button" onPress={showExample} style={s.secondary}><Text style={s.secondaryText}>Посмотреть пример</Text></Pressable>
            {demo && <Text accessibilityRole="text" style={s.demo}>Демонстрация · вымышленный пример</Text>}
            <View style={s.section}>
              <Text accessibilityRole="header" style={s.heading}>Твоя идея</Text>
              <Text style={s.body}>Какая проблема есть сейчас и что ты хочешь улучшить?</Text>
              <TextInput accessibilityLabel="Опиши идею или бизнес-задачу" value={idea} onChangeText={(value) => { setIdea(value); if (error) { setError(false); setMessage(''); } }} multiline placeholder="Например: хотим увеличить долю успешных пополнений" placeholderTextColor="#68716d" style={[s.input, s.idea]} />
              <Pressable accessibilityRole="button" onPress={research} style={s.primary}><Text style={s.primaryText}>Изучить рынок и собрать бриф</Text></Pressable>
              <Text style={s.muted}>AI-поиск пока не подключён</Text>
              {!!message && <Text accessibilityLiveRegion="polite" style={error ? s.error : s.notice}>{message}</Text>}
              <Text style={s.muted}>Не добавляй клиентские данные, секреты и внутренние документы</Text>
            </View>
            <View style={s.section}>
              <Text accessibilityRole="header" style={s.heading}>Рабочий бриф</Text>
              <Text style={s.body}>Заполни поля и поделись ими с командой</Text>
              {fields.map(({ key, label, placeholder }) => <View key={key} style={s.field}>
                <Text style={s.label}>{label}</Text>
                <TextInput accessibilityLabel={label} value={brief[key]} onChangeText={(value) => setBrief((current) => ({ ...current, [key]: value }))} multiline placeholder={placeholder} placeholderTextColor="#68716d" style={s.input} />
              </View>)}
              <Pressable accessibilityRole="button" onPress={saveBrief} style={s.primary}><Text style={s.primaryText}>Сохранить бриф · .txt</Text></Pressable>
              <Text style={s.muted}>В меню выбери «Сохранить в Файлы» или отправь бриф команде</Text>
            </View>
            <View style={s.section}>
              <Text accessibilityRole="header" style={s.heading}>Как задачу решают на рынке</Text>
              <Text style={s.body}>{demo ? 'Пример: сервис предлагает несколько сумм для быстрого выбора. Это иллюстрация, не исследование конкурентов' : 'После подключения поиска здесь появятся примеры решений и ссылки на источники'}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f1' }, grow: { flex: 1 },
  topbar: { minHeight: 56, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#c9ceca' },
  brand: { fontSize: 16, fontWeight: '700', color: '#202721' }, nav: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 }, navText: { fontSize: 15, fontWeight: '600', color: '#354e40' },
  content: { paddingHorizontal: 22, paddingTop: 32, paddingBottom: 54 }, about: { padding: 22, paddingTop: 36 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -0.7, fontWeight: '700', color: '#202721', marginBottom: 14 },
  lead: { fontSize: 18, lineHeight: 27, color: '#414d46', marginBottom: 22 },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: '#202721', marginBottom: 10 },
  body: { fontSize: 16, lineHeight: 24, color: '#414d46', marginBottom: 16 },
  section: { paddingTop: 26, marginTop: 28, borderTopColor: '#cbd1cc', borderTopWidth: StyleSheet.hairlineWidth },
  secondary: { minHeight: 48, paddingHorizontal: 18, alignSelf: 'flex-start', justifyContent: 'center', borderWidth: 1, borderColor: '#aab6ac', borderRadius: 12 }, secondaryText: { color: '#263b2e', fontSize: 16, fontWeight: '600' },
  primary: { minHeight: 52, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#263f31', marginTop: 16 }, primaryText: { color: '#fff', fontSize: 16, lineHeight: 21, fontWeight: '700', textAlign: 'center' },
  field: { marginBottom: 16 }, label: { fontSize: 16, fontWeight: '600', color: '#202721', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#b9c4bb', borderRadius: 12, minHeight: 76, backgroundColor: '#fff', padding: 14, fontSize: 16, lineHeight: 23, color: '#202721', textAlignVertical: 'top' }, idea: { minHeight: 112 },
  muted: { fontSize: 14, lineHeight: 21, color: '#515e55', marginTop: 12 }, notice: { fontSize: 15, lineHeight: 22, color: '#263f31', marginTop: 10 }, error: { fontSize: 15, lineHeight: 22, color: '#9f2727', marginTop: 10 },
  demo: { marginTop: 18, fontSize: 14, lineHeight: 21, fontWeight: '600', color: '#354e40' }, version: { marginTop: 6, fontSize: 17, color: '#202721' },
});
