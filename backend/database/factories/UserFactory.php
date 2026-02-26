<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();

        return [
            'last_name' => $lastName,
            'first_name' => $firstName,
            'middle_name' => fake()->boolean(35) ? fake()->firstName() : null,
            'email' => fake()->unique()->safeEmail(),
            'username' => Str::lower($firstName.'.'.$lastName.'.'.fake()->unique()->numberBetween(100, 9999)),
            'access_type' => fake()->randomElement(['user', 'admin']),
            'is_active' => true,
            'is_authorized' => true,
            'active_session_id' => null,
            'active_device_fingerprint' => null,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => []);
    }
}
