"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import { subjects } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { createCompanion } from "@/lib/actions/companion.actions";
import { companionSchema, CompanionInput } from "@/lib/schemas/companion";

const CompanionForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanionInput>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
      name: "",
      subject: undefined,
      topic: "",
      voice: undefined,
      style: undefined,
      duration: 15,
    },
  });

  const router = useRouter();

  const onSubmit = async (values: CompanionInput) => {
    const result = await createCompanion(values);

    if (result.ok) {
      router.push(`/companions/${result.data.id}`);
    } else {
      console.error(result.error);
      router.push("/");
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FieldGroup>
          <Field>
            <Label htmlFor="name" className="block text-sm font-medium">
              Companion name
            </Label>
            <Input
              id="name"
              placeholder="Enter the companion name"
              {...register("name")}
              required
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </Field>

          <Field>
            <Label htmlFor="subject" className="block text-sm font-medium">
              Subject
            </Label>
            <Controller
              control={control}
              name="subject"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem value={subject} key={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </Field>

          <Field>
            <Label htmlFor="topic" className="block text-sm font-medium">
              What should the companion help with?
            </Label>
            <Textarea
              id="topic"
              placeholder="Ex. Derivates & Integrals"
              {...register("topic")}
            />
            {errors.topic && (
              <p className="text-sm text-destructive">{errors.topic.message}</p>
            )}
          </Field>

          <Field>
            <Label htmlFor="voice" className="block text-sm font-medium">
              Voice
            </Label>
            <Controller
              control={control}
              name="voice"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.voice && (
              <p className="text-sm text-destructive">{errors.voice.message}</p>
            )}
          </Field>

          <Field>
            <Label htmlFor="style" className="block text-sm font-medium">
              Style
            </Label>
            <Controller
              control={control}
              name="style"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.style && (
              <p className="text-sm text-destructive">{errors.style.message}</p>
            )}
          </Field>

          <Field>
            <Label htmlFor="duration" className="block text-sm font-medium">
              Estimated session duration in minutes
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="15"
              {...register("duration", { valueAsNumber: true })}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
            )}
          </Field>

          <Button type="submit" className="w-full cursor-pointer">
            Build Your Companion
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default CompanionForm;
