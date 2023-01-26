import { View, Text, ScrollView, Alert } from "react-native";
import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";
import { Header } from "../components/Header";
import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { useNavigation } from "@react-navigation/native";
import { api } from "../lib/axios";
import { useState, useEffect } from "react";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";

type SummaryProps = Array<{
  id: string;
  date: string;
  amount: number;
  completed: number;
}>;

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

const datesFromYearStart = generateDatesFromYearBeginning();
const minimumSummaryDatesSizes = 18 * 5;
const amountOfDaysToFill = minimumSummaryDatesSizes - datesFromYearStart.length;

const arrayOfDaysToFill =
  amountOfDaysToFill > 0 ? Array.from({ length: amountOfDaysToFill }) : [];

const arrayOfHabitDays = datesFromYearStart.concat(arrayOfDaysToFill);

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryProps | null>(null);
  const { navigate } = useNavigation();

  async function fetchData() {
    try {
      setLoading(true);
      const response = await api.get("/summary");
      setSummary(response.data);
    } catch (error) {
      console.log(JSON.stringify(error));
      Alert.alert("Ops", "Não foi possível carregar o sumário de hábitos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => {
          return (
            <Text
              key={`${weekDay}-${index}`}
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              style={{ width: DAY_SIZE }}
            >
              {weekDay}
            </Text>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {arrayOfHabitDays.map((date, index) => {
              const dayWithHabits = summary.find((day) => {
                return dayjs(date).isSame(day.date, "day");
              });

              if (dayWithHabits) {
                return (
                  <HabitDay
                    key={date.toISOString()}
                    date={date}
                    amountOfHabits={dayWithHabits?.amount}
                    amountCompleted={dayWithHabits?.completed}
                    onPress={() =>
                      navigate("habit", { date: date.toISOString() })
                    }
                  />
                );
              } else {
                return (
                  <View
                    key={index}
                    className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                    style={{ width: DAY_SIZE, height: DAY_SIZE }}
                  />
                );
              }
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
